import { readEnv, readShopEnv } from './env'

describe('readEnv', () => {
  it('returns the Supabase settings when both are valid', () => {
    expect(readEnv({ VITE_SUPABASE_URL: 'https://abc.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon' })).toEqual({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon',
    })
  })

  it('returns null when settings are missing or malformed', () => {
    expect(readEnv({})).toBeNull()
    expect(readEnv({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: 'anon' })).toBeNull()
    expect(readEnv({ VITE_SUPABASE_URL: 'https://abc.supabase.co', VITE_SUPABASE_ANON_KEY: '' })).toBeNull()
  })
})

describe('readShopEnv', () => {
  it('needs both Shopify settings', () => {
    expect(readShopEnv({ VITE_SHOPIFY_STORE_DOMAIN: 'a.myshopify.com', VITE_SHOPIFY_STOREFRONT_TOKEN: 't' })).not.toBeNull()
    expect(readShopEnv({ VITE_SHOPIFY_STORE_DOMAIN: 'a.myshopify.com' })).toBeNull()
  })
})
