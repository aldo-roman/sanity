import {
  Box,
  Button,
  Flex,
  Grid,
  studioTheme,
  Tab,
  TabList,
  TabPanel,
  ThemeProvider,
} from '@sanity/ui'
import {enableVisualEditing} from '@sanity/visual-editing'
import {Suspense, useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'

import {FieldGroups} from './FieldGroups'
import {InternationalizedArrayTest} from './InternationalizedArrayTest'
import {useLiveMode} from './loader'
import {SimpleBlockPortableText} from './SimpleBlockPortableText'

const debugUrls = [
  'https://live-visual-editing-next.sanity.dev/api/draft-mode/enable?sanity-preview-secret=MDM4MTIzNjZjNDg2ZDQxZTIwNzZjYjg0N2Q3ZGM5ZDA',
  'https://visual-editing-next.sanity.dev/api/draft-mode/enable?sanity-preview-secret=ZjdlZjJlODY0ZDk4OTBkMjQyMzAzYmJjM2ZhMTM3OTc&sanity-preview-pathname=%2Fpages-router%2Fshoes',
  'https://visual-editing-page-builder-demo.sanity.dev/api/draft-mode/enable?sanity-preview-secret=NWYyZjc4Yzg1OWM1YmQ4YjljYzVkNTg4YWJiNTBmMjE',
  'https://visual-editing-remix.sanity.dev/shoes',
  'https://nextjs-blog-cms-sanity-v3.sanity.dev/api/draft-mode/enable?sanity-preview-secret=ZTBlODhlYzVlZDRiOGI3Yjc5MDE2Mjg4YTMzY2ExZjM',
  'https://preview-kit-remix.sanity.dev/api/draft?sanity-preview-secret=MDk0OWI0YzJjMzE0YTdhNzVjYzhlOTViNDY1MWU2MTg',
  'https://preview-kit-next-pages-router.sanity.dev/api/draft?sanity-preview-secret=MDk0OWI0YzJjMzE0YTdhNzVjYzhlOTViNDY1MWU2MTg',
  'https://visual-editing-nuxt.sanity.dev/preview/enable?sanity-preview-secret=ZjdlZjJlODY0ZDk4OTBkMjQyMzAzYmJjM2ZhMTM3OTc&sanity-preview-perspective=drafts&sanity-preview-pathname=%2Fshoes',
  'https://preview-kit-next-app-router.sanity.dev/api/draft?sanity-preview-secret=MDk0OWI0YzJjMzE0YTdhNzVjYzhlOTViNDY1MWU2MTg',
  'https://next.sanity.dev/api/draft-mode/enable?sanity-preview-secret=MDk0OWI0YzJjMzE0YTdhNzVjYzhlOTViNDY1MWU2MTg',
  'https://template-nextjs-personal-website.sanity.dev/api/draft-mode/enable?sanity-preview-secret=YTY3NDIzMGRhYzE0NGUyNTEyOWEzNzlhODNkNDE4MGU',
  'https://visual-editing-svelte.sanity.dev/preview/enable?sanity-preview-secret=ZjdlZjJlODY0ZDk4OTBkMjQyMzAzYmJjM2ZhMTM3OTc&sanity-preview-perspective=drafts&sanity-preview-pathname=%2Fshoes',
] as const

function Main() {
  const [id, setId] = useState<'simple' | 'nested' | 'intl-array' | 'debug'>('debug')
  return (
    <>
      <ThemeProvider theme={studioTheme}>
        <Flex direction={'column'}>
          <Box padding={4}>
            <TabList space={2}>
              <Tab
                aria-controls="simple-panel"
                id="simple-tab"
                label="SimpleBlockPortableText"
                onClick={() => setId('simple')}
                selected={id === 'simple'}
              />
              <Tab
                aria-controls="nested-panel"
                id="nested-tab"
                label="FieldGroups"
                onClick={() => setId('nested')}
                selected={id === 'nested'}
              />
              <Tab
                aria-controls="intl-array-panel"
                id="intl-array-tab"
                label="InternationalizedArrayTest"
                onClick={() => setId('intl-array')}
                selected={id === 'intl-array'}
              />
              <Tab
                aria-controls="debug-panel"
                id="debug-tab"
                label="Debug"
                onClick={() => setId('debug')}
                selected={id === 'debug'}
              />
            </TabList>
          </Box>

          {id === 'simple' && (
            <TabPanel aria-labelledby="simple-tab" id="simple-panel">
              <SimpleBlockPortableText />
            </TabPanel>
          )}

          {id === 'nested' && (
            <TabPanel aria-labelledby="nested-tab" id="nested-panel">
              <FieldGroups />
            </TabPanel>
          )}

          {id === 'intl-array' && (
            <TabPanel aria-labelledby="intl-array-tab" id="intl-array-panel">
              <InternationalizedArrayTest />
            </TabPanel>
          )}

          {id === 'debug' && (
            <TabPanel aria-labelledby="debug-tab" id="debug-panel">
              <Grid columns={1} paddingX={4} gap={2}>
                {debugUrls.map((url) => (
                  <Button key={url} as="a" href={url} text={`Go to ${new URL(url).origin}`} />
                ))}
              </Grid>
            </TabPanel>
          )}
        </Flex>
      </ThemeProvider>

      {id !== 'debug' && (
        <Suspense fallback={null}>
          <VisualEditing />
        </Suspense>
      )}
    </>
  )
}

function VisualEditing() {
  useEffect(() => enableVisualEditing(), [])
  useLiveMode({})

  return null
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element not found')
}

const root = createRoot(rootEl)
root.render(<Main />)
