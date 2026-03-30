import { ConnectOptions, NodeWebSocketFactory, connect } from '@hcengineering/api-client'
import tracker from '@hcengineering/tracker'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

async function main (): Promise<void> {
  const client = await connect(url, options)
  try {
    const projects = await client.findAll(tracker.class.Project, {})
    console.log(`Found ${projects.length} projects:`)
    for (const project of projects) {
      console.log(`  - ${project.identifier}: ${project.name ?? project.description ?? '(no name)'}`)
    }
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  void main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
