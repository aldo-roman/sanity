// eslint-disable-next-line import/no-unassigned-import
import 'urlpattern-polyfill'

import {type PreviewUrlAllowOption, type PreviewUrlAllowOptionContext} from '../types'

export async function resolveAllowPattern(
  option: PreviewUrlAllowOption,
  context: PreviewUrlAllowOptionContext,
): Promise<void> {
  const maybePatterns = typeof option === 'function' ? await option(context) : option
  const patterns = Array.isArray(maybePatterns) ? maybePatterns : [maybePatterns]
  for (const pattern of patterns) {
    const urlPattern =
      // eslint-disable-next-line no-nested-ternary
      pattern instanceof URLPattern
        ? pattern
        : pattern instanceof URL
          ? new URLPattern(pattern.hostname, context.origin)
          : new URLPattern(pattern, context.origin)

    if (urlPattern.hostname === '*') {
      throw new Error(
        `It's insecure to allow any hostname, it could disclose data to a malicious site`,
      )
    }
  }
}
