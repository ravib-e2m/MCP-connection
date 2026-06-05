# ✅ GitHub MCP Integration - READY TO TEST

## What's Implemented

### GitHub MCP Server (via Model Context Protocol)
- ✅ **Real MCP Connection** - Using `@modelcontextprotocol/server-github` via stdio transport
- ✅ **List Repositories** - Search and display all your repos
- ✅ **Create Repository** - Create new repos with name, description, and visibility
- ✅ **Create Issues** - Open issues on any repo

### Natural Language Commands Supported

**List Repositories:**
- "list repos"
- "show repos" 
- "list all repos"
- "show all repos"
- "show all repositories"
- "list my repositories"
- "show my repos"

**Create Repository:**
- "create a repo called test"
- "make a repo named my-project"
- "create repository awesome-app"

**Create Issue:**
- "open an issue on myrepo titled bug"
- "create issue in myrepo: fix login"

### What You'll See

**When Listing Repos:**
```
Total Repositories: 5
Username: ravib-e2m
---
1. my-repo: 🌐 public • ⭐ 3 • 🍴 1
2. test-app: 🔒 private • ⭐ 0 • 🍴 0
...
```

**When Creating a Repo:**
```
Repository: test-repo
Visibility: 🌐 Public
Description: My test repository
URL: https://github.com/ravib-e2m/test-repo
Status: ✅ Created via GitHub MCP
```

## How to Test

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the app** at http://localhost:3000

3. **Try these commands** in the chat:
   - "list all repos" 
   - "create a repo called mcp-test"
   - "show my repositories"

## What's Happening Under the Hood

1. You type a message
2. Groq LLM analyzes intent and calls the appropriate tool
3. MCP client spawns `npx -y @modelcontextprotocol/server-github`
4. Communication happens via stdio (standard input/output)
5. GitHub MCP server executes the GitHub API call
6. Result comes back through MCP protocol
7. Groq formats the result into natural language
8. You see the result in the UI

## Environment Variables Required

```env
GROQ_API_KEY=your_groq_key
GITHUB_TOKEN=ghp_...  (with 'repo' scope)
GITHUB_USERNAME=ravib-e2m
```

## Logs to Watch

Check your terminal for these logs:
```
[Chat API] Received message: "list repos"
[Chat API] Tool called: github_list_repos
[MCP] Calling github/search_repositories with args: { query: 'user:ravib-e2m', page: 1, perPage: 30 }
[MCP] Connecting to github server...
[MCP] Connected to github server successfully
[MCP] Executing tool: search_repositories
[MCP] Tool search_repositories executed successfully
[GitHub MCP] Raw result: { ... }
[Chat API] Tool result: { Total Repositories: 5, ... }
```

## Troubleshooting

**"No repositories found"**
- Your GitHub account has no repos yet
- Try creating one: "create a repo called test"

**"Permission denied"**
- GitHub token lacks `repo` scope
- Create new token at: https://github.com/settings/tokens
- Select "repo" (full control of private repositories)

**"MCP server not found"**
- `npx` is not installed
- Install Node.js from https://nodejs.org/

## Next: Slack Integration

Slack MCP is configured but needs valid credentials:
- `SLACK_BOT_TOKEN` must be `xoxb-...` format (bot token)
- `SLACK_TEAM_ID` must be your workspace ID

Get these from: https://api.slack.com/apps
