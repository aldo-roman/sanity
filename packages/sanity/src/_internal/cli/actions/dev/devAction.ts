import path from 'node:path'

import {
  type CliCommandArguments,
  type CliCommandContext,
  type CliConfig,
  type CliOutputter,
} from '@sanity/cli'

import {type DevServerOptions, startDevServer} from '../../server/devServer'
import {checkRequiredDependencies} from '../../util/checkRequiredDependencies'
import {checkStudioDependencyVersions} from '../../util/checkStudioDependencyVersions'
import {getSharedServerConfig, gracefulServerDeath} from '../../util/servers'
import {getTimer} from '../../util/timing'

export interface StartDevServerCommandFlags {
  host?: string
  port?: string
  loadInDashboard?: boolean
}

export const getCoreURL = (): string => {
  return process.env.SANITY_INTERNAL_ENV === 'staging'
    ? 'https://core.sanity.work'
    : 'https://core.sanity.io'
}

export default async function startSanityDevServer(
  args: CliCommandArguments<StartDevServerCommandFlags>,
  context: CliCommandContext,
): Promise<void> {
  const timers = getTimer()
  const flags = args.extOptions
  const {output, workDir, cliConfig} = context

  const loadInDashboard = flags.loadInDashboard || false

  timers.start('checkStudioDependencyVersions')
  checkStudioDependencyVersions(workDir)
  timers.end('checkStudioDependencyVersions')

  // If the check resulted in a dependency install, the CLI command will be re-run,
  // thus we want to exit early
  if ((await checkRequiredDependencies(context)).didInstall) {
    return
  }

  // Try to load CLI configuration from sanity.cli.(js|ts)
  const config = getDevServerConfig({flags, workDir, cliConfig, output})

  try {
    const spinner = output.spinner('Starting dev server').start()
    await startDevServer({...config, skipStartLog: loadInDashboard})
    spinner.succeed()

    if (loadInDashboard) {
      output.print(`Dev server started on ${config.httpPort} port`)
      output.print(`To load in dashboard, open this URL:`)
      output.print(`${getCoreURL()}?dev=http://${config.httpHost}:${config.httpPort}`)
    }
  } catch (err) {
    gracefulServerDeath('dev', config.httpHost, config.httpPort, err)
  }
}

export function getDevServerConfig({
  flags,
  workDir,
  cliConfig,
  output,
}: {
  flags: StartDevServerCommandFlags
  workDir: string
  cliConfig?: CliConfig
  output: CliOutputter
}): DevServerOptions {
  const configSpinner = output.spinner('Checking configuration files...')
  const baseConfig = getSharedServerConfig({flags, workDir, cliConfig})
  configSpinner.succeed()

  const env = process.env // eslint-disable-line no-process-env
  const reactStrictMode = env.SANITY_STUDIO_REACT_STRICT_MODE
    ? env.SANITY_STUDIO_REACT_STRICT_MODE === 'true'
    : Boolean(cliConfig?.reactStrictMode)

  if (env.SANITY_STUDIO_BASEPATH && cliConfig?.project?.basePath) {
    output.warn(
      `Overriding configured base path (${cliConfig.project.basePath}) with value from environment variable (${env.SANITY_STUDIO_BASEPATH})`,
    )
  }

  return {
    ...baseConfig,
    staticPath: path.join(workDir, 'static'),
    reactStrictMode,
    reactCompiler: cliConfig && 'reactCompiler' in cliConfig ? cliConfig.reactCompiler : undefined,
  }
}
