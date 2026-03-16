import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'

vi.mock('../src/services/geo')

import { isPrivateIp, lookupCity } from '../src/services/geo'
import { handler } from '../src/lambda/hello'

const mockIsPrivateIp = vi.mocked(isPrivateIp)
const mockLookupCity = vi.mocked(lookupCity)

function buildEvent(sourceIp: string): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'GET /',
    rawPath: '/',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api',
      domainName: 'test.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'test',
      http: {
        method: 'GET',
        path: '/',
        protocol: 'HTTP/1.1',
        sourceIp,
        userAgent: 'test-agent',
      },
      requestId: 'test-request-id',
      routeKey: 'GET /',
      stage: '$default',
      time: '01/Jan/2026:00:00:00 +0000',
      timeEpoch: 1735689600000,
    },
    isBase64Encoded: false,
  }
}

describe('handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return "hello unknown" without calling lookupCity when IP is private', async () => {
    mockIsPrivateIp.mockReturnValue(true)

    const result = await handler(buildEvent('10.0.0.1')) as APIGatewayProxyStructuredResultV2

    expect(mockLookupCity).not.toHaveBeenCalled()
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body as string)).toEqual({ message: 'hello unknown' })
  })

  it('should return "hello Austin" when IP is public and lookupCity resolves with a city', async () => {
    mockIsPrivateIp.mockReturnValue(false)
    mockLookupCity.mockResolvedValue('Austin')

    const result = await handler(buildEvent('1.2.3.4')) as APIGatewayProxyStructuredResultV2

    expect(mockLookupCity).toHaveBeenCalledWith('1.2.3.4')
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body as string)).toEqual({ message: 'hello Austin' })
  })

  it('should return "hello unknown" when IP is public and lookupCity returns "unknown"', async () => {
    mockIsPrivateIp.mockReturnValue(false)
    mockLookupCity.mockResolvedValue('unknown')

    const result = await handler(buildEvent('1.2.3.4')) as APIGatewayProxyStructuredResultV2

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body as string)).toEqual({ message: 'hello unknown' })
  })

  it('should return statusCode 500 when lookupCity rejects', async () => {
    mockIsPrivateIp.mockReturnValue(false)
    mockLookupCity.mockRejectedValue(new Error('Service unavailable'))

    const result = await handler(buildEvent('1.2.3.4')) as APIGatewayProxyStructuredResultV2

    expect(result.statusCode).toBe(500)
  })

  it('should include content-type application/json header on all success responses', async () => {
    mockIsPrivateIp.mockReturnValue(true)

    const privateResult = await handler(buildEvent('10.0.0.1')) as APIGatewayProxyStructuredResultV2
    expect((privateResult.headers as Record<string, string>)['content-type']).toBe('application/json')

    mockIsPrivateIp.mockReturnValue(false)
    mockLookupCity.mockResolvedValue('Austin')

    const publicResult = await handler(buildEvent('1.2.3.4')) as APIGatewayProxyStructuredResultV2
    expect((publicResult.headers as Record<string, string>)['content-type']).toBe('application/json')
  })
})
