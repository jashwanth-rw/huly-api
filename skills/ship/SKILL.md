---
name: ship
description: Full contribution flow — create Huly issue, branch, commit, PR, merge, and close GitHub issue
---

# Ship — Full Contribution Flow

Automates the complete flow from staged changes to a merged, tracked contribution across Huly and GitHub.

## Interactive Gathering

When `/ship` is invoked (with or without arguments), interactively ask the user for any missing information. Ask one question at a time:

1. **Project** — "Which Huly project? (e.g., MYPROJ)" — If only one project is obvious from context, suggest it as default.
2. **Title** — "What's the issue title?" — Suggest a title based on the `git diff` if changes exist.
3. **Description** — "Any description? (press Enter to skip)" — Optional, suggest one based on the changes.
4. **Priority** — "Priority? 1=Urgent, 2=High, 3=Medium, 4=Low (default: 3)" — Optional, default to 3.

If arguments ARE provided in `$ARGUMENTS`, parse them and skip already-provided fields. Only ask for what's missing.

## Prerequisites

- Must be inside a git repo with uncommitted changes
- Must have `gh` CLI authenticated
- Huly API scripts at `<YOUR_CLONE_PATH>/huly-examples/platform-api/`

## Environment

Always set these env vars when running Huly scripts (load from `.env`):

```
HULY_URL=<your huly url>
HULY_EMAIL=<your email>
HULY_PASSWORD=<your password>
HULY_WORKSPACE=<your workspace>
```

## Flow

Execute these steps in order, AFTER gathering all required info:

### Step 1: Check current state
- Run `git status` to see all changes (staged + unstaged)
- Run `git diff` to understand what changed
- Run `git log --oneline -5` to match commit message style
- If no changes exist, stop and inform the user

### Step 2: Create Huly issue
Run from `<YOUR_CLONE_PATH>/huly-examples/platform-api/`:
```bash
ISSUE_PROJECT=<PROJECT_ID> ISSUE_TITLE="<title>" ISSUE_DESC="<description>" ISSUE_PRIORITY=<priority> npx ts-node src/create-issue.ts 2>&1 | grep -v "no document found"
```
Extract the issue ID (e.g., `MYPROJ-42`) from the output.

### Step 3: Create branch
Create a branch named after the issue:
```bash
git checkout -b <issue-number>-<slugified-title>
```
Example: `42-fix-camera-feed`

### Step 4: Stage and commit
- Stage relevant files (prefer specific files over `git add -A`)
- Commit with message referencing the issue:
```
<Short description of changes>

<ISSUE_ID>: <description>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 5: Push branch
If SSH fails, fall back to HTTPS with gh auth token:
```bash
git remote set-url origin https://$(gh auth token)@github.com/<org>/<repo>.git
git push -u origin <branch-name>
```

### Step 6: Create PR and merge
- Create PR with `gh pr create --title "<ISSUE_ID>: <title>" --base master`
- Merge with `gh pr merge <PR_NUMBER> --merge --admin`
- Do NOT delete the branch

### Step 7: Close the GitHub issue
- Huly auto-creates a GitHub issue within ~1 minute. Search for it:
```bash
gh issue list --repo <org>/<repo> --limit 10 --json number,title,state
```
- Find the matching issue by title
- Comment the PR reference: `gh issue comment <ISSUE_NUMBER> --body "Resolved in PR #<PR_NUMBER>"`
- Close the issue: `gh issue close <ISSUE_NUMBER> --reason completed`

### Step 8: Summary
Print a summary:
```
Shipped!
- Huly issue: <ISSUE_ID>
- Branch: <branch-name>
- PR: #<PR_NUMBER> (merged)
- GitHub issue: #<GH_ISSUE_NUMBER> (closed)
```

## Examples

```
/ship
/ship MYPROJ "Fix camera feed timeout"
```
