---
name: huly
description: Manage Huly issues, projects, and tasks via API
argument-hint: <action> [args...] — list-projects | my-projects | my-issues | create-issue | update-status | add-comment
---

# Huly Project Management

Manage your Huly instance via API from Claude Code.

All scripts live at: `/home/randomwalk/huly-api/huly-examples/platform-api/src/`

## Environment

Always set these env vars when running scripts (load from `.env`):

```
HULY_URL=<your huly url>
HULY_EMAIL=<your email>
HULY_PASSWORD=<your password>
HULY_WORKSPACE=<your workspace>
```

## Actions

Parse `$ARGUMENTS` and run the matching action below. Always run from directory `/home/randomwalk/huly-api/huly-examples/platform-api/` and pipe output through `grep -v "no document found"` to suppress model warnings.

### `list-projects`
List all projects in the workspace.
```bash
npx ts-node src/list-all-projects.ts
```

### `my-projects`
List projects where the user is a member.
```bash
npx ts-node src/list-my-projects.ts
```

### `my-issues`
List all open issues assigned to the user.
```bash
npx ts-node src/list-my-issues.ts
```

### `create-issue`
Create a new issue. Expects: `create-issue <PROJECT_ID> "<title>" ["<description>"] [priority]`
- Priority: 1=Urgent, 2=High, 3=Medium (default), 4=Low
```bash
ISSUE_PROJECT=$1 ISSUE_TITLE="$2" ISSUE_DESC="$3" ISSUE_PRIORITY=${4:-3} npx ts-node src/create-issue.ts
```

### `update-status`
Update an issue's status. Expects: `update-status <ISSUE_ID> <status>`
- Valid statuses: Backlog, Todo, InProgress, Done, Canceled
```bash
ISSUE_ID=$1 ISSUE_STATUS=$2 npx ts-node src/update-issue-status.ts
```

### `add-comment`
Add a comment to an issue. Expects: `add-comment <ISSUE_ID> "<comment text>"`
```bash
ISSUE_ID=$1 COMMENT="$2" npx ts-node src/add-comment.ts
```

## Examples

```
/huly list-projects
/huly my-projects
/huly my-issues
/huly create-issue MYPROJ "Fix camera feed" "RTSP stream dropping frames" 2
/huly update-status MYPROJ-42 Done
/huly add-comment MYPROJ-42 "Fixed in latest deploy"
```

## When no action is provided

If the user just runs `/huly` with no arguments, show the available actions and usage examples.
