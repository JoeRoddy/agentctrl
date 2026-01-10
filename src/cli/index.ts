import { realpathSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const VERSION = '0.1.0'

export function runCli(argv = process.argv) {
  return yargs(hideBin(argv))
    .scriptName('agentctl')
    .version(VERSION)
    .help()
    .command('$0', 'agentctl CLI', () => {}, () => {
      console.log('Hello from agentctl!')
    })
    .parse()
}

const entry = process.argv[1]
if (!entry) {
  runCli()
} else {
  const entryUrl = pathToFileURL(realpathSync(entry)).href
  if (entryUrl === import.meta.url) {
    runCli()
  }
}
