import { z } from 'zod'

import { readShopEnv } from '@/lib/env'

// Shopify Storefront API: which colourways exist in a size, and a cart that leads to Shopify's own
// checkout. Payment never touches our code. Without Shopify keys the demo sample is used.

export type Colourway = { name: string; image?: string; variantId: string; available: boolean }

const API_VERSION = '2025-07'

// ponytail: sample for demo mode (no keys). Galaxy is "sold out" in EU 27 to show that state.
// Product photos from the live shop (Shopify CDN), so demo mode shows the real shoes.
const DEMO_IMAGES: Record<string, string> = {
  Galaxy: 'https://cdn.shopify.com/s/files/1/1043/1220/9753/files/sizeless-galaxy-dreiviertelansicht-vorne-kinderschuh.jpg?v=1780329164',
  Reef: 'https://cdn.shopify.com/s/files/1/1043/1220/9753/files/sizeless-reef-blau-dreiviertelansicht-vorne-kinderschuh.jpg?v=1780329331',
  Sprout: 'https://cdn.shopify.com/s/files/1/1043/1220/9753/files/sizeless-sprout-dreiviertelansicht-vorne-kinderschuh.jpg?v=1780328868',
}

export function demoColourways(size: number): Colourway[] {
  return ['Galaxy', 'Reef', 'Sprout'].map((name) => ({
    name,
    image: DEMO_IMAGES[name],
    variantId: `demo-${name.toLowerCase()}-${size}`,
    available: !(name === 'Galaxy' && size === 27),
  }))
}

async function storefront<T>(query: string, variables: unknown, schema: z.ZodType<T>): Promise<T> {
  const env = readShopEnv()
  if (!env) throw new Error('shop not configured')
  const res = await fetch(`https://${env.VITE_SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.VITE_SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`storefront ${res.status}`)
  return schema.parse((await res.json()).data)
}

const productsSchema = z.object({
  products: z.object({
    nodes: z.array(
      z.object({
        title: z.string(),
        featuredImage: z.object({ url: z.string() }).nullable(),
        variants: z.object({ nodes: z.array(z.object({ id: z.string(), title: z.string(), availableForSale: z.boolean() })) }),
      }),
    ),
  }),
})

const PRODUCTS_QUERY = `query($q: String!) { products(first: 10, query: $q) { nodes { title featuredImage { url } variants(first: 50) { nodes { id title availableForSale } } } } }`

/** One entry per colourway that has a variant in this EU size (sold out ones included). */
export async function fetchColourways(size: number): Promise<Colourway[]> {
  if (!readShopEnv()) return demoColourways(size)
  const { products } = await storefront(PRODUCTS_QUERY, { q: 'vendor:Sizeless' }, productsSchema)
  return products.nodes.flatMap((p) => {
    const v = p.variants.nodes.find((n) => n.title === String(size))
    return v ? [{ name: p.title.replace(/^Sizeless /, ''), image: p.featuredImage?.url, variantId: v.id, available: v.availableForSale }] : []
  })
}

const cartSchema = z.object({
  cartCreate: z.object({
    cart: z.object({ checkoutUrl: z.url() }).nullable(),
    userErrors: z.array(z.object({ message: z.string() })),
  }),
})

const CART_MUTATION = `mutation($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } } }`

/** Creates a cart with one shoe and returns Shopify's checkout URL. The attributes travel with the order (for the order webhook). */
export async function createCheckoutUrl(variantId: string, attributes: Record<string, string>): Promise<string> {
  const input = { lines: [{ merchandiseId: variantId, quantity: 1, attributes: Object.entries(attributes).map(([key, value]) => ({ key, value })) }] }
  const { cartCreate } = await storefront(CART_MUTATION, { input }, cartSchema)
  if (!cartCreate.cart) throw new Error('cart not created')
  return cartCreate.cart.checkoutUrl
}
