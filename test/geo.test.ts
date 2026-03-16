import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isPrivateIp, lookupCity } from '../src/services/geo'

describe('isPrivateIp', () => {
  it('should return true for undefined', () => {
    expect(isPrivateIp(undefined)).toBe(true)
  })

  it('should return true for loopback 127.0.0.1', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
  })

  it('should return true for IPv6 loopback ::1', () => {
    expect(isPrivateIp('::1')).toBe(true)
  })

  it('should return true for 10.x.x.x range', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
  })

  it('should return true for 172.16.x.x (start of private range)', () => {
    expect(isPrivateIp('172.16.0.1')).toBe(true)
  })

  it('should return true for 172.31.x.x (end of private range)', () => {
    expect(isPrivateIp('172.31.255.255')).toBe(true)
  })

  it('should return false for 172.15.x.x (just below private range)', () => {
    expect(isPrivateIp('172.15.0.1')).toBe(false)
  })

  it('should return false for 172.32.x.x (just above private range)', () => {
    expect(isPrivateIp('172.32.0.1')).toBe(false)
  })

  it('should return true for 192.168.x.x range', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true)
  })

  it('should return false for public IP 8.8.8.8', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
  })

  it('should return false for public IP 1.2.3.4', () => {
    expect(isPrivateIp('1.2.3.4')).toBe(false)
  })
})

describe('lookupCity', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return the city name on a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: 'success', city: 'Austin' }),
    }))

    const result = await lookupCity('1.2.3.4')

    expect(result).toBe('Austin')
  })

  it('should return "unknown" when status is not success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: 'fail' }),
    }))

    const result = await lookupCity('1.2.3.4')

    expect(result).toBe('unknown')
  })

  it('should return "unknown" when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await lookupCity('1.2.3.4')

    expect(result).toBe('unknown')
  })

  it('should return "unknown" when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    }))

    const result = await lookupCity('1.2.3.4')

    expect(result).toBe('unknown')
  })

  it('should return "unknown" when response.json() throws (malformed JSON)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    }))

    const result = await lookupCity('1.2.3.4')

    expect(result).toBe('unknown')
  })
})
