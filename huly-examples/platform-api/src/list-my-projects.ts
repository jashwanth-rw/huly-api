import { createClient } from './client'
import tracker from '@hcengineering/tracker'

async function main (): Promise<void> {
  const client = await createClient()
  try {
    const account = await client.getAccount()
    const projects = await client.findAll(tracker.class.Project, {})
    const mine = projects.filter((p: any) => p.members?.includes(account.uuid))

    console.log(`My projects (${mine.length}/${projects.length}):\n`)
    for (const project of mine) {
      console.log(`  [${project.identifier}] ${(project as any).name ?? project.description ?? '(no name)'}`)
    }
  } finally {
    await client.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
