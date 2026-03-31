# Huly API + Claude Code Skills

Manage your [Huly](https://huly.io) project management instance directly from [Claude Code](https://docs.anthropic.com/en/docs/claude-code) using slash commands.

This repo provides:
- TypeScript scripts that wrap the Huly Platform API for common operations
- Claude Code **skills** (`/huly`, `/ship`) that let you manage issues, projects, and full contribution flows from your terminal

## Huly APIs Used

All scripts use the [`@hcengineering/api-client`](https://www.npmjs.com/package/@hcengineering/api-client) SDK to connect to your Huly instance over WebSocket.

### Connection & Authentication

| Method | Description |
|--------|-------------|
| `connect(url, options)` | Connect to Huly using email/password (or token) + workspace name |
| `client.close()` | Gracefully close the connection |
| `client.getAccount()` | Get the authenticated user's account info |
| `client.getModel()` | Access the data model (for resolving statuses, classes, etc.) |

**Authentication options:**
```ts
// Email + Password
{ email: '...', password: '...', workspace: '...', socketFactory: NodeWebSocketFactory }

// Token
{ token: '...', workspace: '...', socketFactory: NodeWebSocketFactory }
```

### Query Operations

| Method | Description |
|--------|-------------|
| `client.findOne(Class, Query, Options?)` | Find a single document matching a query |
| `client.findAll(Class, Query, Options?)` | Find all documents matching a query |

**Query options:** `limit`, `sort` (`SortingOrder.Ascending` / `Descending`), `lookup` (join related docs), `$nin` (not in array).

### Mutation Operations

| Method | Description |
|--------|-------------|
| `client.createDoc(Class, Space, Properties, Id?)` | Create a new document |
| `client.updateDoc(Class, Space, Id, Updates, ReturnResult?)` | Update fields on a document. Supports `$inc` for atomic increments |
| `client.addCollection(Class, Space, AttachedTo, AttachedToClass, Collection, Properties, Id?)` | Create a nested/child document (issues in projects, comments on issues) |

### Markup Operations

| Method | Description |
|--------|-------------|
| `client.uploadMarkup(Class, Id, Field, Content, Format)` | Upload rich text content (supports `'markdown'` format) |
| `client.fetchMarkup(Class, Id, Field, Ref, Format)` | Fetch rendered content back as markdown |

### Key Huly Classes & Constants

| Import | Usage |
|--------|-------|
| `tracker.class.Project` | Query/manage projects |
| `tracker.class.Issue` | Query/manage issues |
| `tracker.taskTypes.Issue` | Issue task type for creation |
| `tracker.status.{Backlog,Todo,InProgress,Done,Canceled}` | Issue status references |
| `contact.class.Person` | Query people / find the current user |
| `IssuePriority` | `0`=NoPriority, `1`=Urgent, `2`=High, `3`=Medium, `4`=Low |
| `core.space.Space` | Space reference for project-level operations |

## Available Scripts

| Script | Description | Extra Env Vars |
|--------|-------------|----------------|
| `src/list-all-projects.ts` | List all projects in the workspace | — |
| `src/list-my-projects.ts` | List projects you're a member of | — |
| `src/list-my-issues.ts` | List open issues assigned to you | — |
| `src/create-issue.ts` | Create a new issue | `ISSUE_PROJECT`, `ISSUE_TITLE`, `ISSUE_DESC`, `ISSUE_PRIORITY` |
| `src/update-issue-status.ts` | Update an issue's status | `ISSUE_ID`, `ISSUE_STATUS` |
| `src/add-comment.ts` | Add a comment to an issue | `ISSUE_ID`, `COMMENT` |

Additional reference examples are in `examples/` (issue CRUD, documents, persons, labels).

## Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- A running Huly instance ([self-hosted](https://huly.io/self-hosting) or [Huly Cloud](https://huly.app))
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed

### 2. Authenticate with GitHub

The `@hcengineering/*` packages are published on GitHub Packages, so you need to be authenticated:

```bash
gh auth login
```

Then configure npm to use your GitHub token for the `@hcengineering` scope:

```bash
echo "@hcengineering:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=$(gh auth token)" > huly-examples/platform-api/.npmrc
```

### 3. Clone and install

```bash
git clone https://github.com/<your-org>/huly-api.git
cd huly-api

# Install root dependencies
npm install

# Install Huly SDK dependencies
cd huly-examples/platform-api
npm install
cd ../..
```

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Huly credentials:

```
HULY_URL=https://your-huly-instance.example.com
HULY_EMAIL=your-email@example.com
HULY_PASSWORD=your-password
HULY_WORKSPACE=your-workspace
```

| Variable | Description | Default (for local dev) |
|----------|-------------|------------------------|
| `HULY_URL` | Your Huly instance URL | `http://localhost:8087` |
| `HULY_EMAIL` | Account email | `user1` |
| `HULY_PASSWORD` | Account password | `1234` |
| `HULY_WORKSPACE` | Workspace slug | `ws1` |

### 5. Test the connection

```bash
cd huly-examples/platform-api
npx ts-node src/list-all-projects.ts
```

You should see your workspace projects listed.

## Installing the Claude Code Skills

The skills let you use `/huly` and `/ship` as slash commands inside Claude Code.

### 1. Copy skills to your Claude config

```bash
# Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills/huly
mkdir -p ~/.claude/skills/ship

# Copy skill definitions
cp skills/huly/SKILL.md ~/.claude/skills/huly/SKILL.md
cp skills/ship/SKILL.md ~/.claude/skills/ship/SKILL.md
```

### 2. Update paths in the skill files

Open each skill file and replace `<YOUR_CLONE_PATH>` with the absolute path to your clone:

```bash
# Example: if you cloned to ~/projects/huly-api
sed -i '' 's|<YOUR_CLONE_PATH>|/Users/you/projects/huly-api|g' ~/.claude/skills/huly/SKILL.md
sed -i '' 's|<YOUR_CLONE_PATH>|/Users/you/projects/huly-api|g' ~/.claude/skills/ship/SKILL.md
```

### 3. Update credentials in the skill files

Replace the environment variable placeholders in both skill files with your actual values, or configure them to read from your `.env` file.

### 4. (Optional) Configure Claude Code permissions

To avoid being prompted for permission on every script run, you can add allowed commands to `.claude/settings.local.json` in the repo (see `.claude/settings.local.json.example`).

### 5. Use the skills

Open Claude Code in any project directory:

```bash
# List your Huly projects
/huly list-projects

# See your open issues
/huly my-issues

# Create an issue
/huly create-issue MYPROJ "Fix login timeout" "OAuth token expires too early" 2

# Update issue status
/huly update-status MYPROJ-42 Done

# Add a comment
/huly add-comment MYPROJ-42 "Deployed to production"

# Full ship flow: create issue -> branch -> commit -> PR -> merge
/ship
```

## Skill Reference

### `/huly` — Issue & Project Management

| Command | Description |
|---------|-------------|
| `/huly list-projects` | List all workspace projects |
| `/huly my-projects` | List your projects |
| `/huly my-issues` | List open issues assigned to you |
| `/huly create-issue <PROJECT> "<title>" ["<desc>"] [priority]` | Create an issue |
| `/huly update-status <ISSUE_ID> <status>` | Update status (Backlog/Todo/InProgress/Done/Canceled) |
| `/huly add-comment <ISSUE_ID> "<text>"` | Comment on an issue |

### `/ship` — Full Contribution Flow

Automates: **Huly issue creation -> git branch -> commit -> push -> PR -> merge -> close GitHub issue**

```bash
/ship                              # Interactive — asks for project, title, etc.
/ship MYPROJ "Fix camera timeout"  # Pre-filled — skips prompts for provided fields
```

## Project Structure

```
huly-api/
├── .env.example                          # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── skills/
│   ├── huly/SKILL.md                     # /huly skill definition
│   └── ship/SKILL.md                     # /ship skill definition
├── huly-examples/
│   └── platform-api/
│       ├── package.json                  # Huly SDK dependencies
│       ├── tsconfig.json
│       ├── src/                          # Main scripts (used by skills)
│       │   ├── client.ts                 # Shared client setup
│       │   ├── list-all-projects.ts
│       │   ├── list-my-projects.ts
│       │   ├── list-my-issues.ts
│       │   ├── create-issue.ts
│       │   ├── update-issue-status.ts
│       │   └── add-comment.ts
│       └── examples/                     # Reference examples
│           ├── issue-list.ts
│           ├── issue-create.ts
│           ├── issue-update.ts
│           ├── issue-labels.ts
│           ├── list-projects.ts
│           ├── person-create.ts
│           ├── person-list.ts
│           └── documents/
│               ├── document-create.ts
│               ├── document-list.ts
│               └── teamspace-create.ts
```

## License

ISC

## Support

- Huly community: [Slack](https://huly.link/slack)
- Claude Code docs: [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code)
