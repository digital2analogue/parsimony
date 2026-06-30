import { describe, it, expect } from 'vitest'

describe('Parsimony Unit Tests', () => {
  it('demonstrates basic unit testing with Vitest', () => {
    const multiply = (a: number, b: number) => a * b
    expect(multiply(3, 4)).toBe(12)
  })

  it('validates token structure', () => {
    const token = {
      name: 'primary',
      value: '#000000',
      type: 'color',
    }
    expect(token).toHaveProperty('name')
    expect(token).toHaveProperty('value')
    expect(token).toHaveProperty('type')
  })
})
