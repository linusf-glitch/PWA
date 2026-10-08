import { expect, test, type Page } from '@playwright/test'

// Core path, first step: sign in with an email code.
// Supabase is mocked at the network level; no real project is contacted.

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'user-1', role: 'authenticated', exp: 4102444800 })}.sig`

async function mockSupabase(page: Page, opts: { validCode: string }) {
  await page.route('**/auth/v1/otp**', (route) => route.fulfill({ json: {} }))
  await page.route('**/auth/v1/verify**', async (route) => {
    const body = route.request().postDataJSON() as { token: string }
    if (body.token !== opts.validCode) {
      return route.fulfill({
        status: 403,
        json: { code: 'otp_expired', error_code: 'otp_expired', msg: 'Token has expired or is invalid' },
      })
    }
    return route.fulfill({
      json: {
        access_token: jwt,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'refresh-1',
        user: { id: 'user-1', aud: 'authenticated', role: 'authenticated', email: 'parent@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-08T00:00:00Z' },
      },
    })
  })
  await page.route('**/auth/v1/logout**', (route) => route.fulfill({ status: 204, body: '' }))
}

test('a parent signs in with an email code and stays signed in', async ({ page }) => {
  await mockSupabase(page, { validCode: '123456' })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

  await page.getByLabel('Email').fill('parent@example.com')
  await page.getByRole('button', { name: 'Send code' }).click()
  await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible()

  // Wrong or expired code: message shown, still signed out.
  await page.getByLabel('6-digit code').fill('000000')
  await expect(page.getByRole('alert')).toContainText('wrong or expired')

  await page.getByLabel('6-digit code').fill('123456')
  await expect(page.getByRole('heading', { name: 'Sizeless' })).toBeVisible()

  // Long session: a reload keeps the parent signed in.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Sizeless' })).toBeVisible()

  await page.getByRole('link', { name: 'Konto' }).click()
  await page.getByRole('button', { name: 'Abmelden' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
