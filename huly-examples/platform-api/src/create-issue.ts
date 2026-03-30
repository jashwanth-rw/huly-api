import core, { type Ref, SortingOrder, generateId } from '@hcengineering/core'
import { makeRank } from '@hcengineering/rank'
import tracker, { type Issue, IssuePriority } from '@hcengineering/tracker'
import { createClient, getMyPersonId } from './client'

/**
 * Usage: ISSUE_PROJECT=RW_GN ISSUE_TITLE="My issue" ISSUE_DESC="Description here" ISSUE_PRIORITY=1 npx ts-node src/create-issue.ts
 *
 * Priority: 0=NoPriority, 1=Urgent, 2=High, 3=Medium, 4=Low
 */
async function main (): Promise<void> {
  const projectIdentifier = process.env.ISSUE_PROJECT
  const title = process.env.ISSUE_TITLE
  const descriptionText = process.env.ISSUE_DESC ?? ''
  const priority = Number(process.env.ISSUE_PRIORITY ?? '3') as IssuePriority

  if (!projectIdentifier || !title) {
    console.error('Usage: ISSUE_PROJECT=<identifier> ISSUE_TITLE="<title>" [ISSUE_DESC="<desc>"] [ISSUE_PRIORITY=3] npx ts-node src/create-issue.ts')
    process.exit(1)
  }

  const client = await createClient()
  try {
    const myPersonId = await getMyPersonId(client)
    const project = await client.findOne(tracker.class.Project, { identifier: projectIdentifier })
    if (project === undefined) {
      throw new Error(`Project "${projectIdentifier}" not found`)
    }

    const issueId: Ref<Issue> = generateId()

    // Increment sequence number
    const incResult = await client.updateDoc(
      tracker.class.Project,
      core.space.Space,
      project._id,
      { $inc: { sequence: 1 } },
      true
    )
    const sequence = (incResult as any).object.sequence

    // Get rank of last issue
    const lastOne = await client.findOne<Issue>(
      tracker.class.Issue,
      { space: project._id },
      { sort: { rank: SortingOrder.Descending } }
    )

    // Upload description markup
    let description: any = ''
    if (descriptionText) {
      description = await client.uploadMarkup(
        tracker.class.Issue, issueId, 'description',
        descriptionText, 'markdown'
      )
    }

    // Create the issue
    await client.addCollection(
      tracker.class.Issue,
      project._id,
      project._id,
      project._class,
      'issues',
      {
        title,
        description,
        status: project.defaultIssueStatus,
        number: sequence,
        kind: tracker.taskTypes.Issue,
        identifier: `${project.identifier}-${sequence}`,
        priority,
        assignee: myPersonId as any,
        component: null,
        estimation: 0,
        remainingTime: 0,
        reportedTime: 0,
        reports: 0,
        subIssues: 0,
        parents: [],
        childInfo: [],
        dueDate: null,
        rank: makeRank(lastOne?.rank, undefined)
      },
      issueId
    )

    const issue = await client.findOne(tracker.class.Issue, { _id: issueId })
    console.log(`Created issue: [${issue?.identifier}] ${issue?.title}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
