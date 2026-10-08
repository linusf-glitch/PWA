import { afterEach, vi } from 'vitest'

import { createCheckoutUrl, demoColourways, fetchColourways } from './shop'

const env = { VITE_SHOPIFY_STORE_DOMAIN: 'shop.myshopify.com', VITE_SHOPIFY_STOREFRONT_TOKEN: 'tok' }

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('shop', () => {
  it('uses the demo sample without Shopify keys', async () => {
    expect(await fetchColourways(27)).toEqual(demoColourways(27))
    expect(demoColourways(27).find((c) => c.name === 'Galaxy')?.available).toBe(false)
  })

  it('lists the colourways that have the size, with availability', async () => {
    Object.entries(env).forEach(([k, v]) => vi.stubEnv(k, v))
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          products: {
            nodes: [
              { title: 'Sizeless Reef', featuredImage: { url: 'https://x/r.jpg' }, variants: { nodes: [{ id: 'v26', title: '26', availableForSale: true }, { id: 'v27', title: '27', availableForSale: false }] } },
              { title: 'Sizeless Sprout', featuredImage: null, variants: { nodes: [{ id: 's26', title: '26', availableForSale: true }] } },
            ],
          },
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchColourways(27)).toEqual([{ name: 'Reef', image: 'https://x/r.jpg', variantId: 'v27', available: false }])
    expect(fetchMock.mock.calls[0][0]).toBe('https://shop.myshopify.com/api/2025-07/graphql.json')
    expect(fetchMock.mock.calls[0][1].headers['X-Shopify-Storefront-Access-Token']).toBe('tok')
  })

  it('creates a cart with the size and setting as attributes and returns the checkout URL', async () => {
    Object.entries(env).forEach(([k, v]) => vi.stubEnv(k, v))
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { cartCreate: { cart: { checkoutUrl: 'https://shop.myshopify.com/cart/c/abc' }, userErrors: [] } } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await createCheckoutUrl('gid://v', { size: '27', setting: 'yellow' })).toBe('https://shop.myshopify.com/cart/c/abc')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.variables.input.lines[0]).toEqual({
      merchandiseId: 'gid://v',
      quantity: 1,
      attributes: [{ key: 'size', value: '27' }, { key: 'setting', value: 'yellow' }],
    })
  })

  it('fails when Shopify refuses the cart', async () => {
    Object.entries(env).forEach(([k, v]) => vi.stubEnv(k, v))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { cartCreate: { cart: null, userErrors: [{ message: 'nope' }] } } }) }))
    await expect(createCheckoutUrl('gid://v', {})).rejects.toThrow()
  })
})
