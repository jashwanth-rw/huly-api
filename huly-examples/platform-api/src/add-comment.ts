import core, { generateId } from '@hcengineering/core'
import tracker from '@hcengineering/tracker'
import { createClient } from './client'

/**
 * Add a comment to an issue.
 *
 * Usage: ISSUE_ID=RW_GN-5 COMMENT="This is my comment" npx ts-node src/add-comment.ts
 */
async function main (): Promise<void> {
  const issueIdentifier = process.env.ISSUE_ID
  const commentText = process.env.COMMENT

  if (!issueIdentifier || !commentText) {
    console.error('Usage: ISSUE_ID=<identifier> COMMENT="<text>" npx ts-node src/add-comment.ts')
    process.exit(1)
  }

  const client = await createClient()
  try {
    const issue = await client.findOne(tracker.class.Issue, { identifier: issueIdentifier })
    if (issue === undefined) {
      throw new Error(`Issue "${issueIdentifier}" not found`)
    }

    const commentId = generateId()

    // Add comment as a ChatMessage in the issue's activity
    await client.addCollection(
      'chunter:class:ChatMessage' as any,
      issue.space,
      issue._id as any,
      issue._class,
      'comments',
      { message: commentText },
      commentId as any
    )

    console.log(`Added comment to [${issue.identifier}] "${issue.title}"`)
    console.log(`  Comment: ${commentText}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
