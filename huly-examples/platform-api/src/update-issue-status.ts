import tracker from '@hcengineering/tracker'
import { createClient } from './client'

/**
 * Update an issue's status.
 *
 * Usage: ISSUE_ID=RW_GN-5 ISSUE_STATUS=InProgress npx ts-node src/update-issue-status.ts
 *
 * Valid statuses: Backlog, Todo, InProgress, Done, Canceled
 */

const STATUS_MAP: Record<string, string> = {
  backlog: 'tracker:status:Backlog',
  todo: 'tracker:status:Todo',
  inprogress: 'tracker:status:InProgress',
  done: 'tracker:status:Done',
  canceled: 'tracker:status:Canceled'
}

async function main (): Promise<void> {
  const issueIdentifier = process.env.ISSUE_ID
  const newStatus = process.env.ISSUE_STATUS

  if (!issueIdentifier || !newStatus) {
    console.error('Usage: ISSUE_ID=<identifier> ISSUE_STATUS=<Backlog|Todo|InProgress|Done|Canceled> npx ts-node src/update-issue-status.ts')
    process.exit(1)
  }

  const statusId = STATUS_MAP[newStatus.toLowerCase()]
  if (!statusId) {
    console.error(`Invalid status: "${newStatus}". Valid: Backlog, Todo, InProgress, Done, Canceled`)
    process.exit(1)
  }

  const client = await createClient()
  try {
    const issue = await client.findOne(tracker.class.Issue, { identifier: issueIdentifier })
    if (issue === undefined) {
      throw new Error(`Issue "${issueIdentifier}" not found`)
    }

    const oldStatusDoc = client.getModel().findAllSync(('core:class:Status' as any), { _id: issue.status })
    const oldStatusName = (oldStatusDoc[0] as any)?.name ?? issue.status

    await client.updateDoc(
      tracker.class.Issue,
      issue.space,
      issue._id,
      { status: statusId as any }
    )

    console.log(`Updated [${issue.identifier}] "${issue.title}"`)
    console.log(`  Status: ${oldStatusName} -> ${newStatus}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
