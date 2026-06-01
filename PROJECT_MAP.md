# My Taske — Project Map

## [TECH_STACK]

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 6.x (strict) |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | 5.0.14 |
| Animation | Framer Motion | 12.40.0 |
| Drag & Drop | @dnd-kit (core + sortable) | 6.3.1 / 10.0.0 |
| Icons | lucide-react | 1.17.0 |
| Class Merge | clsx + tailwind-merge | 2.1.1 / 3.6.0 |
| Dates | date-fns | 4.4.0 |
| IDs | uuid | 14.0.0 |
| Toasts | react-hot-toast | 2.6.0 |

## [ARCHITECTURE]

```
my-taske/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # RootLayout (Geist font, metadata)
│   │   ├── page.tsx                  # Main page (3-panel layout + view routing)
│   │   └── globals.css               # Tailwind v4 + dark mode variant + scrollbar
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # Nav items, projects list, theme toggle
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx          # Draggable task card (sortable)
│   │   │   ├── TaskList.tsx          # DnD context, add task input, filter display
│   │   │   └── TaskDetail.tsx        # Right panel: edit title, priority, date, etc.
│   │   ├── projects/
│   │   │   └── (future — inline CRUD via Sidebar prompts)
│   │   ├── ui/
│   │   │   ├── Button.tsx            # ghost/primary/danger + sm/md/icon
│   │   │   ├── Badge.tsx             # Priority badge
│   │   │   ├── Input.tsx             # Styled text input
│   │   │   └── Modal.tsx             # Overlay modal with backdrop blur
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx         # Stats cards + project progress + overdue alert
│   │   └── command-palette/
│   │       └── CommandPalette.tsx    # Ctrl+K palette (nav, theme, new project)
│   │
│   ├── store/                        # Zustand — domain-split
│   │   ├── useTaskStore.ts           # Tasks CRUD, filter, reorder, active task
│   │   ├── useProjectStore.ts        # Projects CRUD
│   │   └── useUIStore.ts             # Dark mode, focus mode, sidebar, activeTaskId
│   │
│   ├── hooks/
│   │   └── useKeyboard.ts            # Global keyboard shortcut registration
│   │
│   └── lib/                          # Shared core (only reused logic)
│       ├── types.ts                  # Task, Project, Priority, FilterType
│       ├── constants.ts              # PRIORITIES, PROJECT_COLORS, STORAGE_KEYS
│       ├── cn.ts                     # clsx + twMerge utility
│       ├── logger.ts                 # Async non-blocking logger (info/warn/error)
│       └── storage.ts                # loadFromStorage / saveToStorage
│
├── PROJECT_MAP.md                    # ← this file
├── package.json
├── tsconfig.json                     # strict: true, path alias @/*
├── postcss.config.mjs
└── next.config.ts
```

## [SYSTEM_FLOW]

```
User Input (keyboard/mouse)
    │
    ├── Sidebar click → setFilter / setActiveProjectId
    ├── Input + Enter → addTask
    ├── TaskItem click → setActiveTaskId (opens Detail panel)
    ├── Drag handle → reorderTasks (sort)
    ├── Check circle → toggleComplete
    ├── Star → toggleImportant
    ├── Trash → deleteTask
    ├── Ctrl+K → CommandPalette
    ├── F → toggleFocusMode
    └── Theme button → toggleDarkMode
            │
            ▼
    Zustand Store (useTaskStore / useProjectStore / useUIStore)
            │
            ├── saveToStorage() ← auto-save on every mutation
            └── React re-render (selective via Zustand selectors)
```

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Framer Motion animations | Pending | enter/exit transitions, layoutId, drag feedback |
| Focus Mode visual polish | Pending | currently hides non-active tasks, needs overlay |
| Keyboard shortcut: N for new task | Pending | needs input focus trigger |
| Empty project delete (cascade) | Pending | tasks remain orphaned (acceptable for now) |
| Undo toast on delete | Backlog | react-hot-toast installed, not wired |
| Priority colors in TaskDetail | Done | inline picker in detail panel |
| Dashboard overdue detection | Done | compares dueDate < today |
| Drag & Drop | Done | @dnd-kit sortable vertical list |
| Command Palette | Done | filtered search + keyboard nav |
| Dark/Light toggle | Done | persisted to localStorage |
| Auto-save | Done | every mutation writes to localStorage |
