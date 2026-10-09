/* oxlint-disable react/only-export-components -- Shopify loads this module, there is no fast refresh */
import '@shopify/ui-extensions/preact'
import {render} from 'preact'

// Where the button leads. Change to https://app.sizeless-shoe.com once that address points at Vercel.
const APP = 'https://pwa-amber-three.vercel.app'

export default function extension() {
  render(<Extension />, document.body)
}

// The app puts a random one-time code on the cart line (`_return_token`); /return uses it to show the
// order without a login. No code (order not from the app): the block stays empty.
function Extension() {
  const token = shopify.lines.value
    .flatMap((line) => line.attributes ?? [])
    .find((a) => a.key === '_return_token')?.value
  // Orders from the normal shop have no code: show nothing to those customers.
  if (!token) return null
  const href = `${APP}/return?t=${encodeURIComponent(token)}`
  return (
    <s-banner tone="success" heading="Weiter in der Sizeless App">
      <s-stack gap="base">
        <s-text>Dein Profil ist gleich bereit. Tippe hier, um zurückzugehen:</s-text>
        <s-button variant="primary" inlineSize="fill" href={href}>
          Zurück zu deinem Profil
        </s-button>
      </s-stack>
    </s-banner>
  )
}
