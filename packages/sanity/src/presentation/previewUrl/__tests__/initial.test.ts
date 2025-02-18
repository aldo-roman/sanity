import {describe, test} from 'vitest'

describe('previewUrl.initial', () => {
  describe('supported options', () => {
    test.todo('string') // resolves like new URL(previewUrl, location.origin)
    test.todo('URL')
    test.todo('(context) => URL')
    test.todo('(context) => Promise<URL>')
  })
  describe('context', () => {
    test.todo('has a `client` property of SanityClient')
    test.todo('has a `origin` property of location.origin')
    test.todo(
      'has an `initialPreviewUrlParam` property that comes from the `preview` search param in the studio',
    )
  })
  describe('(context) => PromiseLike<URL>', () => {
    test.todo('has to apply the `initialPreviewUrlParam` to support deep linking to a preview') // ?preview=URL
    test.todo('responsible for passing preview perspective search param') // sanity-preview-perspective
    test.todo('responsible for passing vercel protection bypass secrets') // x-vercel-protection-bypass and x-vercel-set-bypass-cookie
  })
  describe('unsupported options', () => {
    test.todo('is required')
    test.todo('(context) => string')
    test.todo('(context) => Promise<string>')
    test.todo('throws on unsupported input')
    test.todo('throws if callback returns unsupported input')
    test.todo('rejects if promise resolves unsupported input')
    test.todo('rejects if promise times out')
  })
})
