import { SortingOrder } from '@hcengineering/core'
import tracker from '@hcengineering/tracker'
import { createClient, getMyPersonId } from './client'

async function main (): Promise<void> {
  const client = await createClient()
  try {
    const myPersonId = await getMyPersonId(client)
    console.log('My person ID:', myPersonId)

    // Find all open issues assigned to me (exclude Done and Canceled)
    const issues = await client.findAll(
      tracker.class.Issue,
      {
        assignee: myPersonId as any,
        status: { $nin: [tracker.status.Done, tracker.status.Canceled] } as any
      },
      {
        sort: { modifiedOn: SortingOrder.Descending }
      }
    )

    console.log(`\nFound ${issues.length} open issues assigned to me:\n`)
    for (const issue of issues) {
      // Resolve status name
      const statusDoc = client.getModel().findAllSync(('core:class:Status' as any), { _id: issue.status })
      const statusName = (statusDoc[0] as any)?.name ?? issue.status

      console.log(`  [${issue.identifier}] ${issue.title}`)
      console.log(`    Status: ${statusName} | Priority: ${issue.priority}`)
      if (issue.dueDate) {
        console.log(`    Due: ${new Date(issue.dueDate).toLocaleDateString()}`)
      }
      console.log()
    }
  } finally {
    await client.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
