import {
  schemaIdSingleton,
  schemaType,
  schemaTypeSingleton,
} from '@sanity/preview-url-secret/constants'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {useActorRef, useSelector} from '@xstate/react'
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react'
import {
  type PermissionCheckResult,
  type Tool,
  useClient,
  useGrantsStore,
  useTranslation,
} from 'sanity'
import {useRouter} from 'sanity/router'

import {API_VERSION} from './constants'
import {presentationLocaleNamespace} from './i18n'
import {previewUrlMachine} from './machines/preview-url'
import {PresentationSpinner} from './PresentationSpinner'
import PresentationTool from './PresentationTool'
import {type PresentationPluginOptions, type PreviewUrlOption} from './types'
import {useVercelBypassSecret} from './useVercelBypassSecret'

export default function PresentationToolGrantsCheck(props: {
  tool: Tool<PresentationPluginOptions>
}): React.JSX.Element {
  const {t} = useTranslation(presentationLocaleNamespace)
  const {previewUrl} = props.tool.options ?? {}
  const {push: pushToast} = useToast()
  const willGeneratePreviewUrlSecret =
    typeof previewUrl === 'object' || typeof previewUrl === 'function'
  const grantsStore = useGrantsStore()
  const [previewAccessSharingCreatePermission, setCreateAccessSharingPermission] =
    useState<PermissionCheckResult | null>(null)
  const [previewAccessSharingUpdatePermission, setUpdateAccessSharingPermission] =
    useState<PermissionCheckResult | null>(null)
  const [previewAccessSharingReadPermission, setReadAccessSharingPermission] =
    useState<PermissionCheckResult | null>(null)
  const [previewUrlSecretPermission, setPreviewUrlSecretPermission] =
    useState<PermissionCheckResult | null>(null)

  useEffect(() => {
    if (!willGeneratePreviewUrlSecret) return undefined

    const previewCreateAccessSharingPermissionSubscription = grantsStore
      .checkDocumentPermission('create', {_id: schemaIdSingleton, _type: schemaTypeSingleton})
      .subscribe(setCreateAccessSharingPermission)
    const previewUpdateAccessSharingPermissionSubscription = grantsStore
      .checkDocumentPermission('update', {_id: schemaIdSingleton, _type: schemaTypeSingleton})
      .subscribe(setUpdateAccessSharingPermission)
    const previewReadAccessSharingPermissionSubscription = grantsStore
      .checkDocumentPermission('read', {_id: schemaIdSingleton, _type: schemaTypeSingleton})
      .subscribe(setReadAccessSharingPermission)
    const previewUrlSecretPermissionSubscription = grantsStore
      .checkDocumentPermission('create', {_id: `drafts.${uuid()}`, _type: schemaType})
      .subscribe(setPreviewUrlSecretPermission)

    return () => {
      previewCreateAccessSharingPermissionSubscription.unsubscribe()
      previewUpdateAccessSharingPermissionSubscription.unsubscribe()
      previewReadAccessSharingPermissionSubscription.unsubscribe()
      previewUrlSecretPermissionSubscription.unsubscribe()
    }
  }, [grantsStore, willGeneratePreviewUrlSecret])

  const canCreateUrlPreviewSecrets = previewUrlSecretPermission?.granted

  useEffect(() => {
    if (!willGeneratePreviewUrlSecret || canCreateUrlPreviewSecrets !== false) return undefined
    const raf = requestAnimationFrame(() =>
      pushToast({
        closable: true,
        status: 'error',
        duration: 30_000,
        title: t('preview-url-secret.missing-grants'),
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [canCreateUrlPreviewSecrets, pushToast, t, willGeneratePreviewUrlSecret])

  const [vercelProtectionBypass, vercelProtectionBypassReadyState] = useVercelBypassSecret()
  const initialPreviewUrl = useInitialPreviewUrl(props.tool.options?.previewUrl)

  // Don't render <PresentationTool /> until we know it's safe to read `location` during render (it's not, if SSR hydration is happening)
  const ready = useSyncExternalStore(
    // eslint-disable-next-line no-empty-function
    useCallback(() => () => {}, []),
    () => true,
    () => false,
  )
  if (!ready || !initialPreviewUrl) return <PresentationSpinner />

  if (
    vercelProtectionBypassReadyState === 'loading' ||
    (willGeneratePreviewUrlSecret &&
      (!previewAccessSharingCreatePermission ||
        typeof previewAccessSharingCreatePermission.granted === 'undefined' ||
        !previewAccessSharingUpdatePermission ||
        typeof previewAccessSharingUpdatePermission.granted === 'undefined' ||
        !previewUrlSecretPermission ||
        !previewAccessSharingReadPermission ||
        typeof previewAccessSharingReadPermission.granted === 'undefined' ||
        typeof previewUrlSecretPermission.granted === 'undefined'))
  ) {
    return <PresentationSpinner />
  }

  return (
    <PresentationTool
      {...props}
      initialPreviewUrl={initialPreviewUrl}
      vercelProtectionBypass={vercelProtectionBypass}
      canCreateUrlPreviewSecrets={canCreateUrlPreviewSecrets === true}
      canToggleSharePreviewAccess={
        previewAccessSharingCreatePermission?.granted === true &&
        previewAccessSharingUpdatePermission?.granted === true
      }
      canUseSharedPreviewAccess={previewAccessSharingReadPermission?.granted === true}
    />
  )
}

function useInitialPreviewUrl(previewUrlOption: PreviewUrlOption | undefined) {
  const client = useClient({apiVersion: API_VERSION})
  const [url, setUrl] = useState<URL | null>(null)
  const router = useRouter()
  const routerSearchParams = new URLSearchParams(router.state._searchParams)
  const previewSearchParam = routerSearchParams.get('preview')
  const actorRef = useActorRef(previewUrlMachine.provide({}), {
    input: {client, previewUrlOption, previewSearchParam},
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setUrl(new URL(location.href))
    }, 3_000)
    return () => clearTimeout(timeout)
  }, [])

  /**
   * Sync configuration changes, as well as deps changes
   */
  useEffect(() => {
    actorRef.send({type: 'update configuration', previewUrlOption, client})
  }, [actorRef, client, previewUrlOption])

  /**
   * Sync changes to router state for the preview search param
   */
  useEffect(() => {
    actorRef.send({type: 'set preview search param', previewSearchParam})
  }, [actorRef, previewSearchParam])

  const error = useSelector(actorRef, (state) =>
    state.hasTag('error') ? state.context.error : null,
  )
  // Propagate the error to the nearest error boundary
  if (error) throw error

  // eslint-disable-next-line no-console
  console.log(useSelector(actorRef, (state) => state))

  return useSelector(actorRef, (state) => state.context.url)
}
