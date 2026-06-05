import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface MCPServer {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport> = new Map();

  async connectToServer(serverName: string, config: MCPServer): Promise<Client> {
    // Check if already connected
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName)!;
    }

    // Resolve environment variables
    const env: Record<string, string> = {};
    
    // Copy process.env, filtering out undefined values
    Object.keys(process.env).forEach(key => {
      const value = process.env[key];
      if (value !== undefined) {
        env[key] = value;
      }
    });
    
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        // Replace ${VAR_NAME} with actual value
        const match = value.match(/^\$\{(.+)\}$/);
        if (match) {
          env[key] = process.env[match[1]] || '';
        } else {
          env[key] = value;
        }
      }
    }

    // Create transport
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env
    });

    // Create client
    const client = new Client({
      name: `mcp-command-${serverName}`,
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    await client.connect(transport);

    // Store
    this.clients.set(serverName, client);
    this.transports.set(serverName, transport);

    return client;
  }

  async disconnect(serverName: string) {
    const client = this.clients.get(serverName);
    if (client) {
      await client.close();
      this.clients.delete(serverName);
      this.transports.delete(serverName);
    }
  }

  async disconnectAll() {
    for (const serverName of this.clients.keys()) {
      await this.disconnect(serverName);
    }
  }

  getClient(serverName: string): Client | undefined {
    return this.clients.get(serverName);
  }
}

// Singleton instance
let mcpManager: MCPClientManager | null = null;

export function getMCPManager(): MCPClientManager {
  if (!mcpManager) {
    mcpManager = new MCPClientManager();
  }
  return mcpManager;
}

export async function callMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  const manager = getMCPManager();
  
  console.log(`[MCP] Calling ${serverName}/${toolName} with args:`, args);
  
  // Load MCP config
  const mcpConfig = {
    github: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
      }
    },
    slack: {
      command: 'npx',
      args: ['-y', 'slack-mcp-server'],
      env: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
        SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || ''
      }
    }
  };

  const config = mcpConfig[serverName as keyof typeof mcpConfig];
  if (!config) {
    throw new Error(`MCP server '${serverName}' not configured`);
  }

  try {
    // Connect to server
    console.log(`[MCP] Connecting to ${serverName} server...`);
    const client = await manager.connectToServer(serverName, config);
    console.log(`[MCP] Connected to ${serverName} server successfully`);

    // Call tool
    console.log(`[MCP] Executing tool: ${toolName}`);
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    
    console.log(`[MCP] Tool ${toolName} executed successfully`);
    return result;
  } catch (error: any) {
    console.error(`[MCP] Error calling ${serverName}/${toolName}:`, error);
    throw error;
  }
}
