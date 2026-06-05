# MCP Architecture - Real Model Context Protocol Implementation

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that standardizes how applications provide context to LLMs. Instead of directly calling APIs, your app connects to **MCP servers** that expose tools and resources.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Chat UI                            │
│                  (SplineChatCard)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Route (/api/chat)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. User message → Groq AI (Llama 3.3 70B)           │  │
│  │  2. AI detects intent → Selects MCP tool             │  │
│  │  3. Call MCP tool via MCP Client                     │  │
│  │  4. Get result → AI generates response               │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   MCP Client Manager                        │
│              (lib/mcp-client.ts)                           │
│  • Manages connections to MCP servers                       │
│  • Routes tool calls to correct server                      │
│  • Handles stdin/stdout communication                       │
└──────────────────────┬─────────────────┬───────────────────┘
                       │                 │
         ┌─────────────┴────┐    ┌──────┴─────────────┐
         ▼                  ▼    ▼                    ▼
┌──────────────────┐  ┌────────────────────┐  ┌─────────────┐
│  GitHub MCP      │  │   Slack MCP        │  │  More MCP   │
│  Server          │  │   Server           │  │  Servers... │
│                  │  │                    │  │             │
│ Tools:           │  │ Tools:             │  │             │
│ • create_repo    │  │ • post_message     │  │             │
│ • list_repos     │  │ • list_channels    │  │             │
│ • create_issue   │  │ • etc.             │  │             │
│ • etc.           │  │                    │  │             │
└────────┬─────────┘  └──────┬─────────────┘  └─────────────┘
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌────────────────────┐
│  GitHub API      │  │   Slack API        │
└──────────────────┘  └────────────────────┘
```

## Key Differences: MCP vs Direct API Calls

### ❌ Direct API Calls (What We Had Before)
```typescript
// Your code directly calls GitHub/Slack APIs
async function createRepo(name: string) {
  const response = await fetch('https://api.github.com/user/repos', {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    body: JSON.stringify({ name })
  });
  return response.json();
}
```

**Problems:**
- You write API client code for every service
- Handle authentication, rate limits, errors yourself
- Hard to add new services
- No standardization

### ✅ MCP (What We Have Now)
```typescript
// Your code calls MCP tool
async function createRepo(name: string) {
  return await callMCPTool('github', 'create_repository', { name });
}
```

**Benefits:**
- ✅ MCP server handles all API complexity
- ✅ Standardized interface across all services
- ✅ Easy to add new services (just add MCP server)
- ✅ Server manages authentication, retries, rate limits
- ✅ Can run servers locally or remotely
- ✅ Tools are discoverable (servers expose schemas)

## MCP Configuration

Located at `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      }
    }
  }
}
```

This tells the MCP client:
- **What command to run** to start the server (`npx`)
- **What package to use** (`@modelcontextprotocol/server-github`)
- **What environment variables** the server needs

## How It Works: Message Flow

### Example: "list my repos"

1. **User types** "list my repos" in chat

2. **Frontend sends** message to `/api/chat`

3. **Groq AI analyzes** message:
   ```
   Intent: List repositories
   Tool: github_list_repos
   ```

4. **API route calls** MCP client:
   ```typescript
   const result = await callMCPTool('github', 'list_repositories', {});
   ```

5. **MCP Client**:
   - Checks if connected to `github` server
   - If not, spawns process: `npx -y @modelcontextprotocol/server-github`
   - Sends JSON-RPC request over stdin:
     ```json
     {
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/call",
       "params": {
         "name": "list_repositories",
         "arguments": {}
       }
     }
     ```

6. **GitHub MCP Server**:
   - Receives request via stdin
   - Calls GitHub API with stored token
   - Returns response via stdout:
     ```json
     {
       "jsonrpc": "2.0",
       "id": 1,
       "result": {
         "content": [{
           "type": "text",
           "text": "[{\"name\": \"repo1\", \"private\": false}, ...]"
         }]
       }
     }
     ```

7. **MCP Client** parses result, returns to API route

8. **API route** formats data, sends to Groq for natural language

9. **Groq AI** generates response: "Your repositories have been listed."

10. **Frontend displays** result card with repo data

## MCP Client Implementation

### Key Components

**MCPClientManager** (`lib/mcp-client.ts`):
- Singleton that manages multiple MCP server connections
- Creates `StdioClientTransport` for each server
- Maintains connection pool
- Handles reconnection

**callMCPTool** function:
```typescript
export async function callMCPTool(
  serverName: string,  // 'github' or 'slack'
  toolName: string,    // 'create_repository', 'list_repositories', etc.
  args: Record<string, any>  // Tool-specific arguments
): Promise<any>
```

### Communication Protocol

MCP uses **JSON-RPC 2.0** over **stdio** (stdin/stdout):

```
Your App          MCP Server
   │                  │
   │─────request─────>│
   │  (via stdin)     │
   │                  │
   │<────response─────│
   │  (via stdout)    │
   │                  │
```

## Available MCP Tools

### GitHub Server Tools

| Tool Name | Description | Arguments |
|-----------|-------------|-----------|
| `create_repository` | Create a new repo | `name`, `description?`, `private?` |
| `list_repositories` | List user's repos | none |
| `create_issue` | Create an issue | `owner`, `repo`, `title`, `body?` |
| `fork_repository` | Fork a repo | `owner`, `repo` |
| `create_pull_request` | Create PR | `owner`, `repo`, `title`, `body`, `head`, `base` |
| And more... | | |

### Slack Server Tools

| Tool Name | Description | Arguments |
|-----------|-------------|-----------|
| `post_message` | Post to channel | `channel_id`, `text` |
| `list_channels` | List channels | none |
| `add_reaction` | Add emoji reaction | `channel_id`, `timestamp`, `reaction` |
| And more... | | |

## Adding More MCP Servers

Want to add Linear, Notion, Jira, etc.?

1. **Find or create MCP server** (check https://github.com/modelcontextprotocol/servers)

2. **Add to `mcp.json`**:
   ```json
   "linear": {
     "command": "npx",
     "args": ["-y", "@modelcontextprotocol/server-linear"],
     "env": {
       "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
   }
   ```

3. **Add tool definitions** in `app/api/chat/route.ts`

4. **Add handler** in `executeTool` function

5. **Done!** Now you can use Linear tools

## Advantages of This Architecture

1. **Separation of Concerns**
   - UI layer doesn't know about API details
   - MCP servers handle all API complexity
   - Easy to test and maintain

2. **Extensibility**
   - Add new services by adding MCP server
   - No code changes to core logic
   - Community can share MCP servers

3. **Standardization**
   - All services exposed the same way
   - Consistent error handling
   - Predictable behavior

4. **AI-Friendly**
   - Tools are self-describing (schemas)
   - AI can discover capabilities
   - Natural language → Tool call

5. **Flexibility**
   - Run servers locally or remotely
   - Can use community servers or build custom ones
   - Easy to mock for testing

## Current vs Previous Implementation

### Before (Direct API):
```
Chat UI → API Route → GitHub API
                   → Slack API
                   → Linear API (would need new code)
```

### Now (MCP):
```
Chat UI → API Route → MCP Client → GitHub MCP Server → GitHub API
                                 → Slack MCP Server → Slack API
                                 → Linear MCP Server → Linear API (just add config!)
```

## Debugging MCP

Check server logs:
```bash
# MCP servers output to stderr
# Check your terminal for errors
```

Test MCP connection manually:
```typescript
import { getMCPManager } from '@/lib/mcp-client';

const manager = getMCPManager();
const client = await manager.connectToServer('github', config);
const tools = await client.listTools();
console.log('Available tools:', tools);
```

## Resources

- **MCP Spec**: https://modelcontextprotocol.io/
- **MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Official Servers**: https://github.com/modelcontextprotocol/servers
- **Community Servers**: Growing ecosystem!

---

**You now have a real MCP implementation!** 🎉

Your chat UI communicates with AI, which uses MCP protocol to talk to standardized servers, which handle all the API complexity. This is the future of AI-app integration!
