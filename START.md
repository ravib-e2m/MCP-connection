# 🚀 Quick Start Guide

## Step 1: Add Your API Keys

Edit `.env.local` and add your credentials:

### Required: Groq API Key (Free)

1. Visit: https://console.groq.com/
2. Sign up with Google/GitHub
3. Go to "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Paste in `.env.local`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

### Required: GitHub Token

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "MCP Command"
4. Select scope: ✅ **repo** (Full control of private repositories)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. Add to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_USERNAME=your_actual_username
   ```

### Optional: Slack Bot Token

1. Visit: https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "MCP Command" and select your workspace
4. Go to "OAuth & Permissions"
5. Under "Scopes" → "Bot Token Scopes", add:
   - ✅ `chat:write`
   - ✅ `channels:read`
6. Click "Install to Workspace" at the top
7. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
8. Add to `.env.local`:
   ```
   SLACK_BOT_TOKEN=xoxb_your_token_here
   ```

## Step 2: Run the App

```bash
npm run dev
```

Open: http://localhost:3000

## Step 3: Try These Commands

**Create a repository:**
```
create a public repo called test-mcp with description testing mcp commands
```

**List your repos:**
```
list my repos
```

**Create an issue:**
```
open an issue on test-mcp titled Add README
```

**Send to Slack (if configured):**
```
send hello world to #general
```

## 🎨 What You'll See

- **Dark card** with white spotlight glow (top-left)
- **Interactive 3D robot** on the right (hover to interact!)
- **Chat interface** on the left with:
  - Message history
  - Tool execution result cards
  - Real-time responses

## 🐛 Troubleshooting

**"Failed to send message"**
- Check that all API keys are set in `.env.local`
- Restart the dev server after adding keys

**GitHub API errors:**
- Verify your GitHub username is correct
- Make sure the token has `repo` scope
- For issues, the repo must exist first

**Spline not loading:**
- Check your internet connection
- The 3D model loads from Spline's CDN

**Rate limits:**
- Groq free tier: 30 requests/minute
- GitHub: 5000 requests/hour
- Just wait a minute and try again

## 🎯 Next Steps

- Customize the Spline 3D model
- Add more tools (Linear, Notion, etc.)
- Change the card styling
- Deploy to Vercel

See `SETUP.md` for detailed documentation!

---

**Enjoy your AI command center!** 🤖✨
