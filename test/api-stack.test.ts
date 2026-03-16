import { describe, it, expect } from 'vitest'
import { App } from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { ApiStack } from '../lib/api-stack'

describe('ApiStack', () => {
  const template = Template.fromStack(new ApiStack(new App(), 'TestStack'))

  it('should have a Lambda function with nodejs22.x runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
    })
  })

  it('should have a Lambda function with arm64 architecture', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Architectures: ['arm64'],
    })
  })

  it('should have exactly one HTTP API', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Api', 1)
  })

  it('should have a GET / route', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /',
    })
  })
})
