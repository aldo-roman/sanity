import {type SanityClient} from 'sanity'
import {assign, setup} from 'xstate'

import {type PreviewUrlOption} from '../types'

interface Context {
  client: SanityClient
  previewUrlOption: PreviewUrlOption | undefined
  url: URL | null
  error: Error | null
  previewSearchParam: string | null
}

type UdateConfigurationEvent = {
  type: 'update configuration'
  previewUrlOption: PreviewUrlOption | undefined
  client: SanityClient
}

type SetPreviewSearchParamEvent = {
  type: 'set preview search param'
  previewSearchParam: string | null
}

type Event = UdateConfigurationEvent | SetPreviewSearchParamEvent

type Input = Omit<UdateConfigurationEvent, 'type'> & Omit<SetPreviewSearchParamEvent, 'type'>

export const previewUrlMachine = setup({
  types: {} as {
    context: Context
    events: Event
    input: Input
    tags: 'busy' | 'ready' | 'error'
  },
  actions: {
    'unexpected error': assign({
      error: () => {
        return new Error('Unexpected error')
      },
    }),
    'throw missing preview url option error': assign({
      error: () => {
        return new TypeError('Missing preview URL option')
      },
    }),

    'throw invalid string preview url option error': assign({
      error: ({context}) => {
        return new TypeError(`Invalid preview URL option: ${context.previewUrlOption}`)
      },
    }),
    'resolve simple string url preview option': assign({
      url: ({context}) => {
        const resolvedUrl = new URL(context.previewUrlOption as unknown as string, location.origin)
        let resultUrl = resolvedUrl
        if (context.previewSearchParam) {
          const restoredUrl = new URL(context.previewSearchParam, resolvedUrl)
          // @TODO verify with previewUrl.allow here
          if (restoredUrl.origin === resolvedUrl.origin) {
            resultUrl = restoredUrl
          }
        }
        return resultUrl
      },
    }),
  },
  actors: {
    //
  },
  guards: {
    'missing preview url option': ({context}) => !context.previewUrlOption,
    'preview url option is invalid string': ({context}) => {
      if (context.previewUrlOption !== 'string') {
        return false
      }
      try {
        const _ = new URL(context.previewUrlOption, location.origin)
        return false
      } catch {
        return true
      }
    },
    'preview url option is string': ({context}) => typeof context.previewUrlOption === 'string',
  },
}).createMachine({
  // eslint-disable-next-line tsdoc/syntax
  /** @xstate-layout N4IgpgJg5mDOIC5QAUBOYBuBLMB3ABAKoBKAMvurAPYA2GYqAxAK4AOEAhgC5j4DGVAHYAzLFGapuWIQG0ADAF1EoVlVhYu0wcpAAPRABYATABoQAT0QBGGwDoAbHKsBWZ-dcB2DwGY5R5wC+AWZomDgEJOSUtPSotlgQNGCM8kpIIKrqmkI6+gjezla2cgCc3j7eJfYAHFYGVh5mlggNRrYlzt5W3kYGJQbetVZGQSHo2HhEZBRwMQzxickyVmkqahpauYgFRaXl3pU1dQ1NiLW2znJXcvUNHtX3HqMgoRMR09F08wlJKUarGXW2W06TyO2KZQqVVq9UaFkQRnsBlsBjk9kRcgepQ8AwMQWCIEEVAgcB0r3CUyisy+qB0mQ2OVBiAAtPZTghWc9yZNIjNqDSFkk6UDNkyEP4PBD9gUuh45M4DOybG0rE5nDiXPKjFUrFzxhTeZ9YrYGKgqLT0vTgVsEEcpfYylZ3M5qgZqkrSrYPIi3AM5XVLk8Cdz3lT+cbYMw+Hw4PBLSLGaA8na9g6us7Xe74eLqs5bIMjLUSi5OvYrNV8QEgA */
  id: 'Preview URL resolver',
  context: ({input}) => ({
    client: input.client,
    previewUrlOption: input.previewUrlOption,
    url: null,
    error: null,
    previewSearchParam: input.previewSearchParam,
  }),

  on: {
    'update configuration': [
      {
        // actions: ['assign options'],
        target: '.idle',
      },
    ],
  },

  states: {
    idle: {
      always: [
        {
          guard: 'missing preview url option',
          actions: ['throw missing preview url option error'],
          target: 'error',
        },
        {
          guard: 'preview url option is invalid string',
          actions: ['throw invalid string preview url option error'],
          target: 'error',
        },
        {
          guard: 'preview url option is string',
          actions: ['resolve simple string url preview option'],
          target: 'success',
        },
      ],
      tags: ['busy'],
    },
    error: {
      tags: ['error'],
    },
    success: {
      tags: ['ready'],
    },
  },

  initial: 'idle',
})
