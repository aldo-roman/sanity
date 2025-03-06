import {type CliCommandArguments, type CliCommandContext} from '@sanity/cli'

import {startDevServer} from '../../server/devServer'
import {gracefulServerDeath} from '../../util/servers'
import {getCoreURL, getDevServerConfig, type StartDevServerCommandFlags} from '../dev/devAction'

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

  // Try to load CLI configuration from sanity.cli.(js|ts)
  const config = getDevServerConfig({
    flags: {
      ...flags,
      port: flags.port || '3333',
    },
    workDir,
    cliConfig,
    output,
  })

  try {
    const spinner = output.spinner('Starting dev server').start()
    await startDevServer({...config, skipStartLog: true, isCoreApp: true})
    spinner.succeed()
    output.print(`Dev server started on ${config.httpPort} port`)
    output.print(`To load in dashboard, open this URL:`)
    output.print(`${getCoreURL()}?dev=http://${config.httpHost}:${config.httpPort}`)
  } catch (err) {
    gracefulServerDeath('dev', config.httpHost, config.httpPort, err)
  }
}
