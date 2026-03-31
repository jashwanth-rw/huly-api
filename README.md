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

## Quick Setup (for any LLM / Agent)

> **Copy-paste this prompt to any AI agent (Claude Code, Cursor, Copilot, etc.) and it will set everything up for you.**

```
Clone and set up the Huly API skill from https://github.com/jashwanth-rw/huly-api.git

Follow these steps IN ORDER:

1. Clone the repo:
   git clone https://github.com/jashwanth-rw/huly-api.git
   cd huly-api

2. Authenticate with GitHub (needed for @hcengineering packages):
   gh auth login  (if not already authenticated)

3. Create .npmrc for GitHub Packages auth (MUST be done BEFORE installing):
   echo '@hcengineering:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken='$(gh auth token) > huly-examples/platform-api/.npmrc

4. Install pnpm globally (if not already installed):
   npm i -g pnpm

5. Install dependencies (MUST run inside platform-api, NOT the root):
   cd huly-examples/platform-api
   pnpm i
   cd ../..

6. Create .env file at huly-examples/platform-api/.env with:
   HULY_URL=<ask me>
   HULY_EMAIL=<ask me>
   HULY_PASSWORD=<ask me>
   HULY_WORKSPACE=<ask me>

7. Test the connection:
   cd huly-examples/platform-api
   npx ts-node src/list-all-projects.ts 2>&1 | grep -v "no document found"

8. Install the skills for your editor:

   FOR CLAUDE CODE:
   - Symlink skills to ~/.claude/skills/:
     mkdir -p ~/.claude/skills
     ln -s $(pwd)/skills/huly ~/.claude/skills/huly
     ln -s $(pwd)/skills/ship ~/.claude/skills/ship
   - Replace <YOUR_CLONE_PATH> in both SKILL.md files with the absolute path to the repo
   - Restart Claude Code. Use /huly and /ship as slash commands.

   FOR CURSOR:
   - Copy skills as Cursor rules in your project:
     mkdir -p .cursor/rules
     cp skills/huly/SKILL.md .cursor/rules/huly.mdc
     cp skills/ship/SKILL.md .cursor/rules/ship.mdc
   - Replace <YOUR_CLONE_PATH> in both .mdc files with the absolute path to the repo
   - Restart Cursor. Ask naturally: "List my Huly projects", "Ship my changes", etc.

IMPORTANT:
- The .npmrc MUST exist before running pnpm i, otherwise @hcengineering packages won't install
- pnpm i MUST run inside huly-examples/platform-api/, NOT the repo root
- Ask the user for their Huly credentials if not provided
```

## Manual Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- A running Huly instance ([self-hosted](https://huly.io/self-hosting) or [Huly Cloud](https://huly.app))

### 2. Clone the repo

```bash
git clone https://github.com/jashwanth-rw/huly-api.git
cd huly-api
```

### 3. Authenticate with GitHub Packages

The `@hcengineering/*` packages are on GitHub Packages. Authenticate with `gh` and create the `.npmrc`:

```bash
gh auth login

echo "@hcengineering:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=$(gh auth token)" > huly-examples/platform-api/.npmrc
```

### 4. Install dependencies

```bash
# Install pnpm globally
npm i -g pnpm

# Install inside platform-api (NOT the repo root)
cd huly-examples/platform-api
pnpm i
cd ../..
```

### 5. Configure environment

Create `huly-examples/platform-api/.env`:

```
HULY_URL=https://your-huly-instance.example.com
HULY_EMAIL=your-email@example.com
HULY_PASSWORD=your-password
HULY_WORKSPACE=your-workspace
```

| Variable | Description |
|----------|-------------|
| `HULY_URL` | Your Huly instance URL |
| `HULY_EMAIL` | Account email |
| `HULY_PASSWORD` | Account password |
| `HULY_WORKSPACE` | Workspace slug |

### 6. Test the connection

```bash
cd huly-examples/platform-api
npx ts-node src/list-all-projects.ts 2>&1 | grep -v "no document found"
```

You should see your workspace projects listed.

## Installing for Claude Code

```bash
# From the huly-api repo root
mkdir -p ~/.claude/skills
ln -s $(pwd)/skills/huly ~/.claude/skills/huly
ln -s $(pwd)/skills/ship ~/.claude/skills/ship

# Update paths in skill files
sed -i "s|<YOUR_CLONE_PATH>|$(pwd)|g" skills/huly/SKILL.md
sed -i "s|<YOUR_CLONE_PATH>|$(pwd)|g" skills/ship/SKILL.md
```

Restart Claude Code. Use `/huly` and `/ship` as slash commands.

```bash
/huly list-projects
/huly my-issues
/huly create-issue MYPROJ "Fix login timeout" "OAuth token expires too early" 2
/huly update-status MYPROJ-42 Done
/huly add-comment MYPROJ-42 "Deployed to production"
/ship
```

## Installing for Cursor

```bash
# From your project directory
mkdir -p .cursor/rules
cp /path/to/huly-api/skills/huly/SKILL.md .cursor/rules/huly.mdc
cp /path/to/huly-api/skills/ship/SKILL.md .cursor/rules/ship.mdc

# Update paths in rule files
sed -i "s|<YOUR_CLONE_PATH>|/path/to/huly-api|g" .cursor/rules/huly.mdc
sed -i "s|<YOUR_CLONE_PATH>|/path/to/huly-api|g" .cursor/rules/ship.mdc
```

Restart Cursor. Ask the agent naturally:

```
List my Huly projects
Create a Huly issue in MYPROJ titled "Fix login timeout"
Update MYPROJ-42 status to Done
Ship my changes
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
