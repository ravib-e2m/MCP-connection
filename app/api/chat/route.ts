import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { callMCPTool } from '@/lib/mcp-client'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

interface Message {
  role: 'user' | 'assistant'
  text: string
  toolUsed?: string
  toolResult?: any
}

const tools = [
  {
    type: "function" as const,
    function: {
      name: "github_create_repository",
      description: "Create a new GitHub repository using MCP",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Repository name"
          },
          description: {
            type: "string",
            description: "Repository description"
          },
          private: {
            type: "boolean",
            description: "Whether the repository should be private"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "github_list_repos",
      description: "List GitHub repositories using MCP",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "github_create_issue",
      description: "Create a GitHub issue using MCP",
      parameters: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner (username)"
          },
          repo: {
            type: "string",
            description: "Repository name"
          },
          title: {
            type: "string",
            description: "Issue title"
          },
          body: {
            type: "string",
            description: "Issue body/description"
          }
        },
        required: ["owner", "repo", "title"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "slack_post_message",
      description: "Post a message to Slack using MCP",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description: "Slack channel ID or name"
          },
          text: {
            type: "string",
            description: "Message text"
          }
        },
        required: ["channel_id", "text"]
      }
    }
  }
]

async function executeTool(toolName: string, args: any) {
  console.log(`[MCP] Executing tool: ${toolName} with args:`, args);
  
  switch (toolName) {
    case 'github_create_repository': {
      try {
        const result = await callMCPTool('github', 'create_repository', {
          name: args.name,
          description: args.description || '',
          private: args.private || false
        });
        
        console.log('[GitHub MCP] Create repo result:', JSON.stringify(result, null, 2));
        
        const data = JSON.parse(result.content?.[0]?.text || '{}');
        
        return {
          'Repository': args.name,
          'Visibility': args.private ? '🔒 Private' : '🌐 Public',
          'Description': args.description || '(no description)',
          'URL': data.html_url || `https://github.com/${process.env.GITHUB_USERNAME}/${args.name}`,
          'Status': '✅ Created via GitHub MCP'
        };
      } catch (error: any) {
        console.error('[GitHub MCP] Create repo error:', error);
        throw new Error(`Failed to create repository: ${error.message}`);
      }
    }

    case 'github_list_repos': {
      try {
        const result = await callMCPTool('github', 'search_repositories', {
          query: `user:${process.env.GITHUB_USERNAME}`,
          page: 1,
          perPage: 30
        });
        
        console.log('[GitHub MCP] Raw result:', JSON.stringify(result, null, 2));
        
        // Format the result
        const data = JSON.parse(result.content?.[0]?.text || '{}');
        const repos = data.items || [];
        
        if (repos.length === 0) {
          return { 
            message: 'No repositories found',
            username: process.env.GITHUB_USERNAME,
            source: 'GitHub MCP Server'
          };
        }
        
        const formatted: any = {
          'Total Repositories': repos.length,
          'Username': process.env.GITHUB_USERNAME,
          '---': '---'
        };
        
        repos.slice(0, 15).forEach((repo: any, idx: number) => {
          formatted[`${idx + 1}. ${repo.name}`] = `${repo.private ? '🔒 private' : '🌐 public'} • ⭐ ${repo.stargazers_count || 0} • 🍴 ${repo.forks_count || 0}`;
        });
        
        return formatted;
      } catch (error: any) {
        console.error('[GitHub MCP] List repos error:', error);
        throw new Error(`Failed to list repositories: ${error.message}`);
      }
    }

    case 'github_create_issue': {
      const owner = args.owner || process.env.GITHUB_USERNAME;
      const result = await callMCPTool('github', 'create_issue', {
        owner,
        repo: args.repo,
        title: args.title,
        body: args.body || ''
      });
      
      return {
        title: args.title,
        repo: `${owner}/${args.repo}`,
        status: 'created'
      };
    }

    case 'slack_post_message': {
      const result = await callMCPTool('slack', 'slack_post_message', {
        channel_id: args.channel_id.replace('#', ''),
        text: args.text
      });
      
      return {
        channel: args.channel_id,
        message: args.text,
        status: 'sent'
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    console.log(`[Chat API] Received message: "${message}"`)

    // Build conversation history
    const messages: any[] = history.map((msg: Message) => ({
      role: msg.role,
      content: msg.text
    }))

    messages.push({
      role: 'user',
      content: message
    })

    // First call to Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant embedded in a sleek dark UI. You control GitHub and Slack via MCP (Model Context Protocol) servers. Always use a tool when the user's intent matches one. After using a tool, respond in ONE short sentence confirming what was done. Be concise — you are in a compact chat panel.

MCP Tools Available:
- github_create_repository: Create repos (requires: name, optional: description, private)
- github_list_repos: List user's repositories  
- github_create_issue: Create issues (requires: owner, repo, title, optional: body)
- slack_post_message: Post to Slack (requires: channel_id, text)

Natural Language Understanding:
- "list repos", "show repos", "list all repos", "show all repos", "show all repositories", "list my repositories", "list all repositories", "show my repos" -> use github_list_repos
- "create a repo called X", "make a repo named X", "create repository X" -> use github_create_repository with name=X
- "send message to #channel" -> use slack_post_message
- Greetings like "hi", "hello", "hey" -> respond naturally, DO NOT trigger any tool

Examples:
- "create a repo called test" -> use github_create_repository
- "list all repos" -> use github_list_repos
- "open an issue on myrepo titled bug" -> use github_create_issue (owner is ${process.env.GITHUB_USERNAME})
- "send hello to #general" -> use slack_post_message
- "hello" -> respond with greeting, NO TOOL

Always prefer using tools over plain responses when the user is asking to perform an action. For greetings, never use tools.`
        },
        ...messages
      ],
      tools: tools,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.7
    })

    const responseMessage = response.choices[0].message

    // Check if tool was called
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const toolName = toolCall.function.name
      const toolArgs = JSON.parse(toolCall.function.arguments)

      console.log(`[Chat API] Tool called: ${toolName}`, toolArgs)

      // Execute the tool
      const toolResult = await executeTool(toolName, toolArgs)

      console.log(`[Chat API] Tool result:`, toolResult)

      // Second call to get natural language response
      const finalResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant. The user asked to perform an action, and it was completed successfully. Respond in ONE short sentence confirming what was done. Be concise and natural.`
          },
          ...messages,
          {
            role: 'assistant',
            content: null,
            tool_calls: responseMessage.tool_calls
          },
          {
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id
          }
        ],
        max_tokens: 512,
        temperature: 0.7
      })

      const service = toolName.startsWith('github') ? 'github' : 'slack'

      return NextResponse.json({
        text: finalResponse.choices[0].message.content,
        toolUsed: toolName,
        toolResult: toolResult,
        service
      })
    }

    // No tool used, return direct response
    return NextResponse.json({
      text: responseMessage.content,
      toolUsed: null,
      toolResult: null,
      service: null
    })

  } catch (error: any) {
    console.error('[Chat API] Error:', error)
    
    // Better error messages
    let errorMessage = error.message || 'Internal server error'
    
    if (errorMessage.includes('ENOENT')) {
      errorMessage = 'MCP server not found. Please ensure npx is installed.'
    } else if (errorMessage.includes('Permission denied')) {
      errorMessage = 'GitHub token lacks required permissions. Please check token scopes.'
    } else if (errorMessage.includes('SLACK_')) {
      errorMessage = 'Slack configuration error. Please check SLACK_BOT_TOKEN and SLACK_TEAM_ID.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
