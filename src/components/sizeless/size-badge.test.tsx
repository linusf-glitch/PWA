import { render } from '@testing-library/react'

import { SizeBadge } from './size-badge'

describe('SizeBadge', () => {
  it('shows the size system and size', () => {
    const { container } = render(<SizeBadge size={27} />)
    expect(container).toHaveTextContent('EU 27')
  })
})
