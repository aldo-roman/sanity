import {describe, test} from 'vitest'

describe('previewUrl.previewMode.enable', () => {
  describe('supported options', () => {
    test.todo('string') // resolves like new URL(previewMode.enable, previewUrl.current) + applies search params
    test.todo('(context) => URL')
    test.todo('(context) => Promise<URL>')
  })
  describe('context', () => {
    test.todo('has a `url` property of URL, the current preview URL')
    test.todo('has a `client` property of SanityClient')
    test.todo('has a `target` property of `preview-iframe`, `preview-popup`, or `share-url')
  })
  describe('(context) => PromiseLike<URL>', () => {
    test.todo('has to append preview url secret and pathname')
    test.todo('responsible for passing preview perspective search param') // sanity-preview-perspective
    test.todo('optionally pass vercel protection bypass secrets') // x-vercel-protection-bypass and x-vercel-set-bypass-cookie
    // does it by default if type is not share-url
  })

  describe('unsupported options', () => {
    test.todo('(context) => string')
    test.todo('(context) => Promise<string>')
    test.todo('throws on unsupported input')
    test.todo('throws if callback returns unsupported input')
    test.todo('rejects if promise resolves unsupported input')
    test.todo('rejects if promise times out')
  })
})
