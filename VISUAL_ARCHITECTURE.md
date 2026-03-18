# OpenBot UI - Visual Architecture

## Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx (Root)                          │
│  - State management: currentPage, selectedBotId                │
│  - Route navigation                                             │
│  - Layout wrapper                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────V────────┐   ┌─────V──────────┐
            │   Navbar       │   │   Main Content │
            │ (Navigation)   │   │   (Dynamic)    │
            └────────────────┘   └─────┬──────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
            ┌───────V────┐    ┌────────V────────┐  ┌────V────────┐
            │ Dashboard  │    │ BotDetailsPage  │  │ Credentials │
            │            │    │                 │  │ Page        │
            │ - List     │    │ - Bot info      │  │             │
            │   all bots │    │ - Quick stats   │  │ - List      │
            │ - Create   │    │ - Nav to other  │  │   secrets   │
            │   modal    │    │   pages         │  │ - Create    │
            │ - Delete   │    └─────────────────┘  │ - Copy      │
            │   bots     │                          │ - Delete    │
            └────────────┘                          └─────────────┘
                                                           
                                         ┌─────────────────┐
                                         │  WebChat Page   │
                                         │                 │
                                         │ - List channels │
                                         │ - Create        │
                                         │ - Delete        │
                                         │ - View secrets  │
                                         └─────────────────┘
```

## Component Hierarchy

```
App
├── Navbar
│   └── Navigation buttons
├── Main Content (conditional)
│   ├── Dashboard
│   │   ├── Alert (if error/success)
│   │   ├── Card (each bot)
│   │   │   ├── Button (view/delete)
│   │   │   └── Bot info
│   │   └── Modal (create)
│   │       ├── Input (handle)
│   │       ├── Input (endpoint)
│   │       └── Input (schema version)
│   │
│   ├── BotDetailsPage
│   │   ├── Button (back)
│   │   ├── Card (bot info)
│   │   ├── Card (credentials overview)
│   │   │   ├── Button (manage)
│   │   │   └── Stats
│   │   ├── Card (webchat overview)
│   │   │   ├── Button (manage)
│   │   │   └── Stats
│   │   └── Card (quick stats)
│   │
│   ├── CredentialsPage
│   │   ├── Button (back)
│   │   ├── Alert (if error/success)
│   │   ├── Button (new credential)
│   │   ├── LoadingSpinner
│   │   ├── Card (each credential)
│   │   │   ├── Button (copy)
│   │   │   └── Button (delete)
│   │   └── Modal (create)
│   │       ├── Input (description)
│   │       └── Input (expiration)
│   │
│   └── WebChatPage
│       ├── Button (back)
│       ├── Alert (if error/success)
│       ├── Button (new channel)
│       ├── LoadingSpinner
│       ├── Card (each channel)
│       │   ├── Button (edit)
│       │   └── Button (delete)
│       └── Modal (create)
│           └── Input (name)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      API Client Service                     │
│  - axios instance                                           │
│  - Base URL: http://localhost:3000                         │
│  - All CRUD methods for bots, credentials, channels        │
└─────────────────────────────────────────────────────────────┘
         ▲                      ▲                       ▲
         │                      │                       │
         │ get/create/          │ get/create/          │ get/create/
         │ update/delete        │ update/delete        │ update/delete
         │                      │                       │
    ┌────┴────────┐       ┌────┴────────┐        ┌────┴────────┐
    │   Bots      │       │ Credentials │        │  WebChat    │
    │             │       │             │        │             │
    │ /bots       │       │ /bots/:id/  │        │ /bots/:id/  │
    │             │       │ credentials │        │ webchat     │
    └─────────────┘       └─────────────┘        └─────────────┘
         ▲                      ▲                       ▲
         │ useFetch             │ useFetch             │ useFetch
         │ hook                 │ hook                 │ hook
         │                      │                      │
    ┌────┴────────┐       ┌────┴────────┐        ┌────┴────────┐
    │  Dashboard  │       │ Credentials │        │  WebChat    │
    │  (queries)  │       │ Page        │        │ Page        │
    │             │       │ (queries)   │        │ (queries)   │
    └─────────────┘       └─────────────┘        └─────────────┘
         ▲                      ▲                       ▲
         │ state                │ state                │ state
         │ updates              │ updates              │ updates
         │                      │                      │
    ┌────┴────────────────────┴────────────────────┴──────────┐
    │           React Components (render)                      │
    └────────────────────────────────────────────────────────┘
         │
         └──── Display → User Interaction → setState → Re-render
```

## State Management Pattern

```
┌──────────────────────────────────────────────┐
│              Page Component                  │
│  ┌────────────────────────────────────────┐  │
│  │ State Variables                        │  │
│  │ - showModal: boolean                   │  │
│  │ - formData: object                     │  │
│  │ - loading: boolean                     │  │
│  │ - error: string | null                 │  │
│  │ - success: string | null               │  │
│  └────────────────────────────────────────┘  │
│                    │                         │
│  ┌────────────────▼────────────────────────┐ │
│  │ Data Fetching (useFetch hook)           │ │
│  │ - Async data loading                   │ │
│  │ - Loading state                        │ │
│  │ - Error handling                       │ │
│  └────────────────────────────────────────┘ │
│                    │                         │
│  ┌────────────────▼────────────────────────┐ │
│  │ Event Handlers                         │ │
│  │ - handleCreate()                       │ │
│  │ - handleDelete()                       │ │
│  │ - handleUpdate()                       │ │
│  └────────────────┬───────────────────────┘ │
│                   │                         │
│  ┌────────────────▼────────────────────────┐ │
│  │ Render Components                      │ │
│  │ - Card, Button, Modal, Input, etc.     │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## User Journey Map

```
User Opens App
     │
     V
  Navbar + Dashboard Loads
     │
     ├─── [Create Bot] ──→ Modal → Form → API Call → Reload List
     │
     ├─── [View Bot] ──→ BotDetailsPage
     │         │
     │         ├─── [Manage Credentials] → CredentialsPage
     │         │         │
     │         │         ├─── [Create] → Modal → API → Reload
     │         │         ├─── [Copy] → Clipboard → Toast
     │         │         └─── [Delete] → Confirm → API → Reload
     │         │
     │         └─── [Manage Channels] → WebChatPage
     │                 │
     │                 ├─── [Create] → Modal → API → Reload
     │                 └─── [Delete] → Confirm → API → Reload
     │
     └─── [Delete Bot] ──→ Confirm → API → Reload Dashboard
```

## Component Props Flow

```
Dashboard
  ├─ onSelectBot: (botId: string) => void
  │  └─ BotDetailsPage
  │     ├─ botId: string
  │     ├─ onBack: () => void
  │     ├─ onNavigateToCredentials: () => void
  │     │  └─ CredentialsPage
  │     │     ├─ botId: string
  │     │     └─ onBack: () => void
  │     └─ onNavigateToWebChat: () => void
  │        └─ WebChatPage
  │           ├─ botId: string
  │           └─ onBack: () => void
  │
  └─ Reusable Components (passed to pages)
     ├─ Alert: type | title | message | onClose
     ├─ Button: variant | size | loading | onClick | children
     ├─ Card: children | className | clickable | onClick
     ├─ Input: label | error | helper | value | onChange
     ├─ Modal: isOpen | title | onClose | onAction | children
     ├─ LoadingSpinner: size | label
     └─ Navbar: brand | items | currentPath | onNavigate
```

## API Request Sequence

```
User Action
    │
    V
Component Handler (e.g., handleCreate)
    │
    V
Validation Check
    │
    ├─ Invalid ──→ Show Error Alert ──→ Return
    │
    └─ Valid
        │
        V
    Set Loading = true
    Disable Button
    │
    V
API Call (axios)
    │
    ├─ Success ──→ Set Success Message
    │            │
    │            V
    │         Clear Form
    │         Close Modal
    │         Reload Data
    │         Wait 1s
    │         Refresh Page
    │
    └─ Error ──→ Set Error Message
                 │
                 V
             Show Error Alert
             Set Loading = false
             Keep Form Data
```

## Navigation State Machine

```
                    ┌─────────────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                │    ┌─────V─────┐   │
                │    │ BotDetails│   │
                │    └─────┬─────┘   │
                │          │         │
                │     ┌────┴─────┐   │
                │     │          │   │
                │  ┌──V──┐  ┌────V──┐
                │  │Creds│  │WebChat│
                │  └──┬──┘  └───┬───┘
                │     │         │
                └─────┼─────────┘
                      │
                    [Back]
                      │
                      V
                  Dashboard
```

## Error Handling Flow

```
Component Mounts / User Action
    │
    V
Try Block
    │
    ├─ API Call
    │   │
    │   ├─ Success ──→ Update State ──→ Show Success Alert
    │   │
    │   └─ Error
    │       │
    │       V
    │   Catch Block
    │       │
    │       V
    │   Extract Error Message
    │   Set Error State
    │   Show Error Alert
    │
    └─ Finally Block
        │
        V
    Stop Loading
    Enable Buttons
```

## Responsive Design Breakpoints

```
Mobile (< 768px)
├─ Single column layouts
├─ Full-width cards
├─ Stacked buttons
└─ Touch-friendly spacing

Tablet (768px - 1024px)
├─ Two column grids
├─ Adjusted padding
└─ Optimized spacing

Desktop (> 1024px)
├─ Three column grids
├─ Full layouts
├─ More white space
└─ Hover effects enabled
```

## Color & Theme Structure

```
Primary Colors (Sky Blue)
├─ primary-50 (lightest)
├─ primary-500 (standard)
├─ primary-600 (buttons/links)
├─ primary-700 (hover state)
└─ primary-900 (darkest)

Neutral Colors (Gray)
├─ gray-50 (backgrounds)
├─ gray-200 (borders)
├─ gray-600 (secondary text)
└─ gray-900 (primary text)

Status Colors
├─ Green-600 (success)
├─ Red-600 (error/danger)
└─ Blue-600 (info)
```

---

Generated: January 2026
