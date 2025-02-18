import {type SanityClient} from 'sanity'
import {describe, expect, test} from 'vitest'

import {type PreviewUrlAllowOptionContext} from '../../types'
import {resolveAllowPattern} from '../allow'

const context = {
  client: {} as SanityClient,
  origin: location.origin,
} satisfies PreviewUrlAllowOptionContext

describe('previewUrl.allow', () => {
  describe('supported options', () => {
    test.todo('string')
    test.todo('URL')
    test.todo('URLPattern')
    test.todo('(string | URL | URLPattern)[]')
    test.todo('(context) => string')
    test.todo('(context) => URL')
    test.todo('(context) => URLPattern')
    test.todo('(context) => (string | URL | URLPattern)[]')
    test.todo('(context) => Promise<(string | URL | URLPattern)[]>')
  })
  describe('unsupported options', () => {
    test('disallows * for hostname', async () => {
      await expect(
        resolveAllowPattern('https://*', context),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It's insecure to allow any hostname, it could disclose data to a malicious site]`,
      )
      await expect(
        resolveAllowPattern(new URLPattern('https://*', location.origin), context),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It's insecure to allow any hostname, it could disclose data to a malicious site]`,
      )
      await expect(
        resolveAllowPattern(['https://*', new URLPattern('https://*', location.origin)], context),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It's insecure to allow any hostname, it could disclose data to a malicious site]`,
      )
      await expect(
        resolveAllowPattern(
          async ({origin}) => ['https://*', new URLPattern('https://*', origin)],
          context,
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: It's insecure to allow any hostname, it could disclose data to a malicious site]`,
      )
    })
    test.todo('throws on unsupported input')
    test.todo('throws if callback returns unsupported input')
    test.todo('rejects if promise resolves unsupported input')
    test.todo('rejects if promise times out')
  })
})
