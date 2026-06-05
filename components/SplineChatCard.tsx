'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { SplineScene } from '@/components/ui/spline'
import { Send, Bot, GitBranch, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  toolUsed?: string
  toolResult?: Record<string, any>
  service?: 'github' | 'slack'
}

const exampleCommands = [
  "List my repos",
  "Create a repo called test",
  "List Slack channels"
]

export function SplineChatCard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: messages
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      
      console.log('[Frontend] Received data:', data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text,
        toolUsed: data.toolUsed,
        toolResult: data.toolResult,
        service: data.service
      }

      console.log('[Frontend] Created message:', assistantMessage);

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipClick = (command: string) => {
    setInput(command)
  }

  return (
    <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden border-white/5">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <div className="flex h-full">
        {/* LEFT: Chat Interface */}
        <div className="flex-1 p-8 relative z-10 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-1">
              MCP Command
            </h1>
            <p className="text-neutral-500 text-sm">
              GitHub + Slack · REAL MCP · powered by AI
            </p>
          </div>

          {/* Message List */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto mb-3 pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 mt-8">
                <p className="text-neutral-600 text-xs mb-3">Try these commands:</p>
                {exampleCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(cmd)}
                    className="border border-white/10 rounded-full px-3 py-1.5 text-xs text-neutral-400 hover:border-white/25 hover:text-neutral-200 cursor-pointer transition-all duration-200 text-left"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && <ThinkingBubble />}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
              placeholder="list repos, create repo, list channels..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:border-white/20 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 text-neutral-300" />
            </button>
          </div>
        </div>

        {/* RIGHT: Spline Robot */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex justify-end"
      >
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
          <p className="text-neutral-200 text-sm">{message.text}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex gap-2.5"
    >
      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3 h-3 text-neutral-400" />
      </div>
      <div className="flex-1">
        {message.toolResult ? (
          <div className="space-y-2">
            <ResultCard 
              toolUsed={message.toolUsed!} 
              data={message.toolResult} 
              service={message.service}
            />
            <p className="text-neutral-300 text-sm leading-relaxed">{message.text}</p>
          </div>
        ) : (
          <p className="text-neutral-300 text-sm leading-relaxed">{message.text}</p>
        )}
      </div>
    </motion.div>
  )
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5"
    >
      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3 h-3 text-neutral-400" />
      </div>
      <div className="flex gap-1 px-1 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </motion.div>
  )
}

function ResultCard({ toolUsed, data, service }: { toolUsed: string; data: Record<string, any>; service?: string }) {
  const actionLabel = toolUsed
    .replace('github_', '')
    .replace('slack_', '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="border border-white/10 rounded-xl p-3 bg-white/[0.03]"
    >
      <div className="flex items-center gap-2 mb-2">
        {service === 'github' ? (
          <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
        ) : (
          <Hash className="w-3.5 h-3.5 text-neutral-400" />
        )}
        <span className="text-xs font-medium text-neutral-300">{actionLabel}</span>
        <span className="ml-auto text-xs text-green-400/80">✓ done</span>
      </div>
      <div className="space-y-0.5">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs py-0.5">
            <span className="text-neutral-500">{key}</span>
            <span className="text-neutral-300 font-mono text-right ml-2 truncate max-w-[200px]">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
