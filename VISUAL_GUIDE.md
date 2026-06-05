# 🎨 Visual Guide - Component Breakdown

## Card Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ WHITE SPOTLIGHT GLOW (top-left)                            │
│                                                                 │
│  ┌────────────────────────┬──────────────────────────────────┐ │
│  │   LEFT: CHAT PANEL     │   RIGHT: 3D SPLINE ROBOT        │ │
│  │   (New Implementation)  │   (Unchanged from Original)      │ │
│  │                        │                                  │ │
│  │  ┌──────────────────┐  │  ┌────────────────────────────┐ │ │
│  │  │ MCP Command      │  │  │                            │ │ │
│  │  │ GitHub·Slack·AI  │  │  │     🤖                     │ │ │
│  │  └──────────────────┘  │  │   Interactive              │ │ │
│  │                        │  │   3D Robot                 │ │ │
│  │  ┌──────────────────┐  │  │   (hover to interact)      │ │ │
│  │  │ Message List     │  │  │                            │ │ │
│  │  │ ┌──────────────┐ │  │  │                            │ │ │
│  │  │ │ User Msg  ◀──┤ │  │  │                            │ │ │
│  │  │ └──────────────┘ │  │  │                            │ │ │
│  │  │ ┌──────────────┐ │  │  │                            │ │ │
│  │  │ │🤖 AI Response│ │  │  │                            │ │ │
│  │  │ │ ┌──────────┐ │ │  │  │                            │ │ │
│  │  │ │ │ResultCard│ │ │  │  │                            │ │ │
│  │  │ │ └──────────┘ │ │  │  │                            │ │ │
│  │  │ └──────────────┘ │  │  │                            │ │ │
│  │  │ (scrollable)     │  │  │                            │ │ │
│  │  └──────────────────┘  │  └────────────────────────────┘ │ │
│  │                        │                                  │ │
│  │  ┌──────────────────┐  │                                  │ │
│  │  │ Input ▸ [Send]   │  │                                  │ │
│  │  └──────────────────┘  │                                  │ │
│  └────────────────────────┴──────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
   Dark Card (bg-black/96) • Rounded • 600px height • Full width
```

## Component Hierarchy

```
Page (bg-neutral-950)
└── SplineChatCard
    ├── Card (bg-black/96, rounded-xl, h-[600px])
    │   ├── Spotlight (white glow, top-left)
    │   └── Flex Container (h-full)
    │       ├── LEFT PANEL (flex-1, p-8, z-10)
    │       │   ├── Header
    │       │   │   ├── Title (gradient text)
    │       │   │   └── Subtitle (neutral-500)
    │       │   │
    │       │   ├── Message List (flex-1, overflow-y-auto)
    │       │   │   ├── Empty State (chips)
    │       │   │   │   └── Example Commands × 3
    │       │   │   │
    │       │   │   ├── Message Bubbles
    │       │   │   │   ├── UserMessage (right-aligned)
    │       │   │   │   │   └── Text
    │       │   │   │   │
    │       │   │   │   └── AIMessage (left-aligned)
    │       │   │   │       ├── Bot Avatar
    │       │   │   │       ├── ResultCard (if tool used)
    │       │   │   │       └── Text
    │       │   │   │
    │       │   │   └── ThinkingBubble (3 animated dots)
    │       │   │
    │       │   └── Input Bar
    │       │       ├── Input Field
    │       │       └── Send Button
    │       │
    │       └── RIGHT PANEL (flex-1, relative)
    │           └── SplineScene
    │               └── Suspense
    │                   ├── Loading Spinner
    │                   └── Spline (lazy)
```

## Color Palette

```
Background (page):
  bg-neutral-950       ████████  #0a0a0a

Card:
  bg-black/96          ████████  rgba(0, 0, 0, 0.96)

Text:
  text-neutral-50      ████████  #fafafa (title)
  text-neutral-200     ████████  #e5e5e5 (user messages)
  text-neutral-300     ████████  #d4d4d4 (AI messages)
  text-neutral-400     ████████  #a3a3a3 (labels)
  text-neutral-500     ████████  #737373 (subtitle)
  text-neutral-600     ████████  #525252 (placeholder)

Borders:
  border-white/10      ════════  rgba(255, 255, 255, 0.1)
  border-white/20      ════════  rgba(255, 255, 255, 0.2)
  border-white/25      ════════  rgba(255, 255, 255, 0.25)

Backgrounds (elements):
  bg-white/5           ░░░░░░░░  rgba(255, 255, 255, 0.05)
  bg-white/7           ░░░░░░░░  rgba(255, 255, 255, 0.07)
  bg-white/10          ░░░░░░░░  rgba(255, 255, 255, 0.1)
  bg-white/15          ░░░░░░░░  rgba(255, 255, 255, 0.15)

Accents:
  text-green-400/80    ████████  rgba(74, 222, 128, 0.8) (success)
```

## Visual States

### Empty State
```
┌────────────────────────┐
│ MCP Command            │
│ GitHub · Slack · AI    │
├────────────────────────┤
│                        │
│ Try these commands:    │
│ ┌────────────────────┐ │
│ │ Create a GitHub    │ │  ← Clickable chip
│ │ repo               │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Send a Slack       │ │
│ │ message            │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ List my repos      │ │
│ └────────────────────┘ │
│                        │
├────────────────────────┤
│ [Input field]    [📤] │
└────────────────────────┘
```

### User Message
```
                    ┌──────────────┐
                    │ create a repo│  ← Right-aligned
                    │ called test  │     bg-white/10
                    └──────────────┘     Rounded-2xl
```

### AI Response with Result Card
```
┌─┬────────────────────────┐
│🤖│ ┌────────────────────┐ │  ← Left-aligned
│ │ │ 🔀 Create Repo  ✓  │ │     Bot avatar
│ │ ├────────────────────┤ │     Result card
│ │ │ name:  test        │ │     with tool info
│ │ │ vis:   public      │ │
│ │ │ url:   github.c... │ │
│ │ └────────────────────┘ │
│ │                        │
│ │ Created your repo!     │  ← AI response text
└─┴────────────────────────┘
```

### Thinking State
```
┌─┬────────────────────────┐
│🤖│ ● ● ●                  │  ← Animated dots
└─┴────────────────────────┘     Bounce with delay
```

### Input States
```
Default:
[create a repo            ] [📤]
 └─ bg-white/5, border-white/10

Focus:
[create a repo            ] [📤]
 └─ bg-white/7, border-white/25
    ↑ Transitions smoothly

Loading:
[                         ] [⏳]
 └─ Disabled, opacity-40
```

## Animations Timeline

```
Page Load:
0.00s ─┬─ Card renders
       │
0.75s ─┼─ Spotlight starts fading in
       │
2.75s ─┴─ Spotlight fully visible

Message Send:
0.00s ─┬─ User message appears (fade + slide up)
       │
0.25s ─┼─ User message fully visible
       │   API call starts
       │
0.30s ─┼─ Thinking dots appear
       │
~2.0s ─┼─ AI response arrives
       │   Result card appears (scale + spring)
       │
~2.3s ─┴─ AI text appears (fade + slide up)
```

## Responsive Behavior

```
Desktop (≥1024px):
├── Left panel: 50%
└── Right panel: 50%

Tablet (768-1023px):
├── Left panel: 50%
└── Right panel: 50%
    (Robot may be cropped)

Mobile (<768px):
├── Stack vertically?
└── (Not explicitly designed for mobile in requirements)
```

## Interactive Elements

### Hover States
```
Example Chip:
  Default:  border-white/10, text-neutral-400
  Hover:    border-white/25, text-neutral-200

Send Button:
  Default:  bg-white/10, border-white/10
  Hover:    bg-white/15, border-white/20
  Active:   scale-95

Input Field:
  Default:  bg-white/5, border-white/10
  Focus:    bg-white/7, border-white/25

3D Robot:
  Default:  Static pose
  Hover:    Follows mouse (built into Spline)
```

## Spotlight Effect

```
Position: -top-40 left-0 md:left-60 md:-top-20
Size:     h-[169%] w-[138%] lg:w-[84%]
Filter:   Gaussian blur (stdDeviation: 151)
Fill:     White with 21% opacity
Animation: spotlight (2s ease, 0.75s delay)

Visual effect:
     ╱╲
    ╱  ╲
   ╱    ╲       ← Large soft white glow
  ╱  ☁️  ╲         radiating from top-left
 ╱        ╲        over the chat panel
╱__________╲
```

## Scrollbar Styling

```
Width:       6px (thin)
Track:       transparent
Thumb:       white/10 (subtle)
Thumb Hover: white/15
Radius:      3px (rounded)

Only visible when content overflows
Matches dark UI aesthetic
```

## Icon Usage

```
Bot:        <Bot className="w-3 h-3" />         (AI avatar)
GitBranch:  <GitBranch className="w-3.5 h-3.5" /> (GitHub icon)
Hash:       <Hash className="w-3.5 h-3.5" />      (Slack icon)
Send:       <Send className="w-3.5 h-3.5" />      (Send button)
```

## Font Sizes

```
Title:       text-3xl (30px)
Subtitle:    text-sm (14px)
Messages:    text-sm (14px)
Input:       text-sm (14px)
Card Label:  text-xs (12px)
Chip:        text-xs (12px)
```

## Spacing

```
Card:
  Padding:     none (children handle spacing)
  Height:      600px
  Border:      1px (white/5)

Left Panel:
  Padding:     p-8 (32px all sides)
  Gap:         mb-4 (header), mb-3 (input)

Messages:
  Gap:         space-y-3 (12px between)
  Padding:     px-4 py-2.5 (messages)
              px-3 py-1.5 (chips)

Result Card:
  Padding:     p-3 (12px)
  Gap:         mb-2 (header), py-0.5 (rows)

Input Bar:
  Gap:         gap-2 (8px between input and button)
  Height:      ~40px (auto from padding)
```

---

**Every detail matters.** This guide shows the precision that went into
matching the reference while building a fully functional interface. 🎨✨
