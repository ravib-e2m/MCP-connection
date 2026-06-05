# Spline Chat Card - Setup Instructions

A beautiful dark UI card featuring an interactive 3D Spline robot with a functional AI chatbot that controls GitHub and Slack.

## 🎨 Visual Design

Replicates the exact visual style from the 21st.dev Spline Scene demo:
- Dark black card with white spotlight glow
- Interactive 3D robot on the right (same Spline scene)
- Functional AI chatbot interface on the left

## 🚀 Quick Start

### 1. Install Dependencies

Already installed! But if needed:

```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` with your credentials:

#### Groq API Key
1. Go to https://console.groq.com/
2. Sign up/login
3. Create an API key
4. Add to `.env.local`: `GROQ_API_KEY=gsk_...`

#### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Generate and copy the token
5. Add to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_...
   GITHUB_USERNAME=your_github_username
   ```

#### Slack Bot Token (Optional)
1. Go to https://api.slack.com/apps
2. Create a new app (from scratch)
3. Go to "OAuth & Permissions"
4. Add bot token scopes:
   - `chat:write`
   - `channels:read`
5. Install app to workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
7. Add to `.env.local`: `SLACK_BOT_TOKEN=xoxb-...`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Commands

Try these commands in the chat:

1. **Create a public repo:**
   ```
   create a public repo called mcp-demo with description my first mcp project
   ```

2. **Create a private repo:**
   ```
   create a private repository named secret-vault
   ```

3. **List repositories:**
   ```
   list my repos
   ```

4. **Send Slack message:**
   ```
   send hello team to #general on slack
   ```

5. **Create an issue:**
   ```
   open an issue on mcp-demo titled Fix navbar bug
   ```

## 🏗️ Architecture

### Components

- **SplineChatCard** (`components/SplineChatCard.tsx`)
  - Main component combining Spline 3D and chat interface
  - Left panel: Chat UI with message history, input, and result cards
  - Right panel: Interactive Spline 3D robot

- **Spotlight** (`components/ui/spotlight.tsx`)
  - Aceternity-style spotlight effect
  - Creates the white radial glow in the top-left

- **SplineScene** (`components/ui/spline.tsx`)
  - Lazy-loaded Spline component wrapper
  - Shows loading spinner while loading

### API Route

- **`/api/chat`** (`app/api/chat/route.ts`)
  - Handles chat messages
  - Uses Groq API with Llama 3.3 70B model
  - Supports function calling for GitHub and Slack tools
  - Executes real API calls (not mocked)

### Available Tools

**GitHub:**
- `github_create_repo` - Create repositories
- `github_list_repos` - List user repositories
- `github_create_issue` - Create issues on repos

**Slack:**
- `slack_send_message` - Send messages to channels
- `slack_list_channels` - List available channels

## 🎨 Styling

- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Animations:** Framer Motion
- **3D:** Spline (@splinetool/react-spline)
- **AI:** Groq SDK (Llama 3.3 70B)

### Color Palette

- Background: `bg-neutral-950`
- Card: `bg-black/[0.96]`
- Text: `text-neutral-200` / `text-neutral-300`
- Borders: `border-white/10`
- Accent: White spotlight glow

## 🔧 Customization

### Change the 3D Model

Edit the Spline scene URL in `SplineChatCard.tsx`:

```tsx
<SplineScene
  scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
  className="w-full h-full"
/>
```

### Add More Tools

Add to the `tools` array in `app/api/chat/route.ts`:

```typescript
{
  type: "function" as const,
  function: {
    name: "your_tool_name",
    description: "What it does",
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "..." }
      },
      required: ["param1"]
    }
  }
}
```

Then implement in the `executeTool` function.

### Modify Card Dimensions

In `SplineChatCard.tsx`, change:

```tsx
<Card className="w-full h-[600px] ...">
```

## 🐛 Troubleshooting

### Spline not loading
- Check internet connection
- Verify the Spline URL is correct
- Check browser console for errors

### API errors
- Verify all environment variables are set
- Check token permissions and scopes
- Look at the browser console and terminal logs

### GitHub API fails
- Ensure `GITHUB_USERNAME` matches your GitHub username exactly
- For creating issues, the repository must exist first

### Groq rate limits
- Free tier has rate limits
- Consider upgrading or implementing retry logic

## 📝 Notes

- The right side (Spline robot) is EXACTLY as the 21st.dev demo - same scene, same interactivity
- All API calls are real - no mocking
- The AI uses Groq's Llama 3.3 70B model for fast responses
- Tool detection is handled by the LLM, not hardcoded patterns

## 🌟 Features

- ✅ Real-time chat interface
- ✅ Function calling with GitHub & Slack
- ✅ Beautiful dark UI with spotlight effect
- ✅ Interactive 3D Spline robot
- ✅ Smooth animations with Framer Motion
- ✅ Result cards showing tool execution
- ✅ Auto-scrolling message list
- ✅ Loading states and error handling
- ✅ Responsive design

Enjoy building with your AI-powered command center! 🚀
