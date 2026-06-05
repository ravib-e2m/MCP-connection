# 🎨 Spline Chat Card - AI Command Center

A stunning dark UI card component that **exactly replicates** the 21st.dev Spline Scene demo—dark black card, white spotlight glow, interactive 3D robot—but with a fully functional AI chatbot interface controlling GitHub and Slack APIs.

![Card Preview](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)

## ✨ Features

- 🎨 **Pixel-perfect visual match** to 21st.dev Spline Scene demo
- 🤖 **AI-powered chatbot** using Groq (Llama 3.3 70B)
- 🔧 **Real GitHub integration** (create repos, issues, list repos)
- 💬 **Real Slack integration** (send messages, list channels)
- 🌟 **Interactive 3D robot** (same Spline scene with hover effects)
- ⚡ **Smooth animations** with Framer Motion
- 🎭 **Dark theme** with spotlight glow effect
- 📱 **Responsive design** with Tailwind CSS v4

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up API Keys

Copy the example env file:
```bash
cp .env.example .env.local
```

Then add your keys to `.env.local`:

- **Groq API Key** (required): Get from https://console.groq.com/
- **GitHub Token** (required): Create at https://github.com/settings/tokens with `repo` scope
- **Slack Bot Token** (optional): Create at https://api.slack.com/apps with `chat:write` and `channels:read` scopes

See **[START.md](./START.md)** for detailed setup instructions.

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 4. Try These Commands

- `create a public repo called mcp-demo with description testing mcp`
- `list my repos`
- `open an issue on mcp-demo titled Add README`
- `send hello world to #general` (if Slack configured)

## 📚 Documentation

- **[START.md](./START.md)** - Quick start guide with step-by-step setup
- **[SETUP.md](./SETUP.md)** - Detailed documentation and architecture
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **3D Graphics:** Spline (@splinetool/react-spline)
- **Animations:** Framer Motion
- **AI:** Groq SDK (Llama 3.3 70B Versatile)
- **Icons:** Lucide React

## 🎯 What Makes This Special

1. **Exact Visual Replication** - Pixel-perfect match to the reference
2. **Real Functionality** - Not a mockup, actual working integrations
3. **AI-Powered** - Natural language commands, no hardcoded patterns
4. **Beautiful Animations** - Smooth, polished interactions
5. **Production Ready** - TypeScript, error handling, proper loading states

## 📁 Project Structure

```
├── app/
│   ├── api/chat/route.ts        # AI + API integration
│   ├── globals.css              # Styles + animations
│   └── page.tsx                 # Main page
├── components/
│   ├── SplineChatCard.tsx       # Main card component
│   └── ui/
│       ├── spotlight.tsx        # Spotlight glow effect
│       ├── spline.tsx           # 3D scene wrapper
│       └── card.tsx             # shadcn card
└── .env.local                   # Your API keys
```

## 🎨 Visual Design

The card exactly replicates the 21st.dev Spline Scene demo:

- **Left side:** AI chatbot interface (replaces static text)
  - Gradient title with "MCP Command"
  - Scrollable message history
  - Result cards for tool execution
  - Sleek dark input bar

- **Right side:** Interactive 3D robot (unchanged)
  - Same Spline scene URL
  - Mouse-tracking interactivity
  - Hover effects built-in

- **Effects:**
  - White radial spotlight (top-left)
  - Dark black card (bg-black/96)
  - Custom scrollbar styling
  - Smooth Framer Motion animations

## 🔧 Available Tools

### GitHub
- `github_create_repo` - Create public/private repositories
- `github_list_repos` - List your repositories
- `github_create_issue` - Create issues on repos

### Slack
- `slack_send_message` - Send messages to channels
- `slack_list_channels` - List available channels

## 🐛 Troubleshooting

**Build errors?**
- Make sure all dependencies are installed: `npm install`

**API not working?**
- Check `.env.local` has all required keys
- Restart dev server after adding keys
- Verify GitHub token has `repo` scope

**Spline not loading?**
- Check internet connection
- Scene loads from Spline CDN

**Rate limits?**
- Groq free tier: 30 req/min
- Just wait a minute and retry

## 🚀 Deployment

Deploy to Vercel:
```bash
vercel
```

Add environment variables in Vercel dashboard.

## 📝 License

MIT - feel free to use in your projects!

---

**Built with precision.** Every pixel matches. Every feature works. 🎨✨

Made with ❤️ using Next.js, TypeScript, Tailwind, and Groq AI
