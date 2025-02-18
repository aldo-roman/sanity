import {describe, test} from 'vitest'

describe('presentationTool({previewUrl})', () => {
  describe('supported options', () => {
    test.todo('previewUrl can be a string of a relative URL')
    test.todo('previewUrl can be a string of an absolute URL')
    test.todo('previewUrl can be a URL instance')
    test.todo('allow is optional', () => {
      // previewUrl: {initial: 'https://example.com'}
    })
  })
  describe('unsupported options', () => {
    test.todo('initial is required')
  })
  describe('deprecated options', () => {
    test.todo('initial is not required if legacy `preview` is set')
    test.todo('if `origin` is defined, and `allow` not, it is used as `allow`')
    test.todo('document PreviewUrlResolver', () => {
      /**
       * @example
       * ```ts
      previewUrl: async (context): Promise<string> => {
        const {
          client,
          previewUrlSecret,
          studioPreviewPerspective,
          previewSearchParam,
          studioBasePath,
        } = context

        return new URL().toString()
      }
       * ```
       */
      // document how to use the async version of `initial` if `previewMode` type functionality isn't needed.
      // as well as how to use the new async `previewMode` type instead
    })
    test.todo('`preview` is deprecated, use `initial` instead')
    test.todo('origin is deprecated', () => {
      // Short hands that can use new root setup
      // a) just origin
      // given: {previewUrl: {origin: 'https://example.com'}}
      // use {previewUrl: 'https://example.com'}
      // b) just origin and preview with the default '/' state
      // given: {previewUrl: {origin: 'https://example.com', preview: '/'}}
      // use {previewUrl: 'https://example.com'}
      // c) just origin and preview, setup the url with new URL
      // given: {previewUrl: {origin: 'https://example.com', preview: '/en'}}
      // use {previewUrl: new URL('/en', 'https://example.com')}
      // previewMode is also present, root shorthand can't be used
      // a) just origin
      // given: {previewUrl: {origin: 'https://example.com', previewMode: {enable: '/api/enable}}}
      // use {previewUrl: {initial: 'https://example.com', previewMode: {enable: '/api/enable}}}
      // b) just origin and preview with the default '/' state
      // given: {previewUrl: {origin: 'https://example.com', preview: '/', previewMode: {enable: '/api/enable}}}
      // use {previewUrl: {initial: 'https://example.com', previewMode: {enable: '/api/enable}}}
      // c) just origin and preview, setup the url with new URL
      // given: {previewUrl: {origin: 'https://example.com', preview: '/en', previewMode: {enable: '/api/enable}}}
      // use {previewUrl: {initial: new URL('/en', 'https://example.com'), previewMode: {enable: '/api/enable}}}
    })
    test.todo('draftMode is deprecated, use previewMode instead')
  })
})
