import { parseScanResult } from './events'

const event = (detail: unknown) => new CustomEvent('fpt-add-to-cart', { detail })

describe('parseScanResult', () => {
  it('accepts the documented payload (size may arrive as text)', () => {
    expect(parseScanResult(event({ measurement_id: 'm1', size: '27', article_number: 'A1' }))?.size).toBe(27)
  })

  it('rejects a payload without a measurement or with an impossible size', () => {
    expect(parseScanResult(event({ size: 27, article_number: 'A1' }))).toBeNull()
    expect(parseScanResult(event({ measurement_id: 'm1', size: 99, article_number: 'A1' }))).toBeNull()
    expect(parseScanResult(event(undefined))).toBeNull()
  })
})
