import {type CliCommandArguments, type CliCommandContext} from '@sanity/cli'

import {startDevServer} from '../../server/devServer'
import {gracefulServerDeath} from '../../util/servers'
import {getCoreAppURL, getDevServerConfig, type StartDevServerCommandFlags} from '../dev/devAction'

export default async function startAppDevServer(
  args: CliCommandArguments<StartDevServerCommandFlags>,
  context: CliCommandContext,
): Promise<void> {
  const flags = args.extOptions

  const {output, workDir, cliConfig} = context
  if (flags.loadInDashboard === false) {
    output.warn(`Core applications cannot be run without dashboard`)
    output.warn(`Starting dev server with the --loadInDashboard flag set to true`)
  }

  let organizationId: string | undefined
  if (
    cliConfig &&
    '__experimental_coreAppConfiguration' in cliConfig &&
    cliConfig.__experimental_coreAppConfiguration?.organizationId
  ) {
    organizationId = cliConfig.__experimental_coreAppConfiguration.organizationId
  }

  if (!organizationId) {
    output.error(`Core applications require an organization ID`)
    process.exit(1)
  }

  // Try to load CLI configuration from sanity.cli.(js|ts)
  const config = getDevServerConfig({
    flags,
    workDir,
    cliConfig,
    output,
  })

  try {
    const spinner = output.spinner('Starting dev server').start()
    await startDevServer({...config, skipStartLog: true, isCoreApp: true})
    spinner.succeed()

    output.print(`Dev server started on port ${config.httpPort}`)
    output.print(`To load in dashboard, open this URL:`)
    output.print(
      getCoreAppURL({organizationId, httpHost: config.httpHost, httpPort: config.httpPort}),
    )
  } catch (err) {
    gracefulServerDeath('dev', config.httpHost, config.httpPort, err)
  }
}
