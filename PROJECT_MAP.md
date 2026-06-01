# My Taske — Project Map

## [TECH_STACK]

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, static export) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS | 4.x |
| Font | Cairo (Arabic + Latin) | next/font |
| State | Zustand | 5.0.14 |
| Animation | Framer Motion | 12.40.0 |
| Drag & Drop | @dnd-kit (core + sortable) | 6.3.1 / 10.0.0 |
| Icons | lucide-react | 1.17.0 |
| Class Merge | clsx + tailwind-merge | 2.1.1 / 3.6.0 |
| IDs | uuid | 14.0.0 |

## [ARCHITECTURE]

```
my-taske/
├── public/
│   ├── logo.svg                   # SVG logo (checkmark + My Taske)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # RootLayout (Cairo font, dir=rtl, lang=ar)
│   │   ├── page.tsx               # Main page (3-panel layout + view routing)
│   │   ├── globals.css            # Tailwind v4 + RTL + dark mode
│   │   ├── not-found.tsx          # 404 page (Arabic)
│   │   └── error.tsx              # Error page (Arabic)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx        # Responsive: overlay mobile, fixed desktop + SVG logo
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx       # Draggable task card (React.memo)
│   │   │   ├── TaskList.tsx       # DnD context, add task input, filter display
│   │   │   └── TaskDetail.tsx     # Right panel: title, priority, date, etc.
│   │   ├── ui/
│   │   │   ├── Button.tsx         # ghost/primary/danger + sm/md/icon
│   │   │   ├── Badge.tsx          # Priority badge
│   │   │   └── Input.tsx          # Styled text input
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx      # Stats cards + project progress + overdue
│   │   └── command-palette/
│   │       └── CommandPalette.tsx # Ctrl+K palette (Arabic)
│   │
│   ├── store/                     # Zustand — domain-split
│   │   ├── useTaskStore.ts        # Tasks CRUD, filter, reorder
│   │   ├── useProjectStore.ts     # Projects CRUD
│   │   └── useUIStore.ts          # Dark mode, focus mode, sidebar, activeTaskId
│   │
│   ├── hooks/
│   │   └── useKeyboard.ts         # Global keyboard shortcuts (stale-closure safe)
│   │
│   └── lib/                       # Shared core
│       ├── types.ts               # Task, Project, Priority, FilterType
│       ├── constants.ts           # PRIORITIES (Arabic), PROJECT_COLORS, STORAGE_KEYS, getToday()
│       ├── cn.ts                  # clsx + twMerge utility
│       ├── logger.ts              # Async non-blocking logger
│       └── storage.ts             # loadFromStorage / saveToStorage
│
├── PROJECT_MAP.md
├── netlify.toml
├── next.config.ts                 # Static export config
├── package.json
└── tsconfig.json                  # strict: true, path alias @/*
```

## [SYSTEM_FLOW]

```
User Input (keyboard/mouse/touch)
    │
    ├── Hamburger (mobile) → toggle sidebar overlay
    ├── Sidebar backdrop (mobile) → close sidebar
    ├── Sidebar click (Dashboard) → onViewChange('dashboard') + close sidebar
    ├── Sidebar click (nav item) → onViewChange('app') + setFilter + close sidebar
    ├── Sidebar click (project) → onViewChange('app') + setActiveProjectId + close sidebar
    ├── Sidebar delete (×) → deleteProject + confirm
    ├── Input (N) → focus task input
    ├── Input + Enter → addTask
    ├── TaskItem tap → setActiveTaskId (full-screen detail on mobile, panel on desktop)
    ├── Drag handle → reorderTasks (@dnd-kit sortable)
    ├── Check circle → toggleComplete
    ├── Star → toggleImportant
    ├── Trash → deleteTask
    ├── Ctrl+K → CommandPalette (Arabic)
    ├── F → toggleFocusMode
    └── Theme button → toggleDarkMode
            │
            ▼
    Zustand Store → saveToStorage() ← auto-save on every mutation
                  → React re-render (selective via selectors + React.memo)
```

## [FIXES & IMPROVEMENTS]

| # | المشكلة | الإجراء | الحالة |
|---|---------|--------|--------|
| 1 | AnimatePresence mode="popLayout" مع <div> وسيط | نُقل <div> خارج AnimatePresence | ✅ |
| 2 | useKeyboard stale closure | useRef بدلاً من dependency array | ✅ |
| 3 | اختصار N مفقود | إضافة focus على input via data-task-input | ✅ |
| 4 | activeTaskId غير مستخدم في page.tsx | إزالة الكود الميت | ✅ |
| 5 | sidebarOpen غير مستخدم | إزالة الاستدعاءات غير المستخدمة | ✅ |
| 6 | Modal.tsx غير مستخدم بالكامل | حذف الملف | ✅ |
| 7 | getFilteredTasks() كل render | تحسين باستخدام Today utility + memo | ✅ |
| 8 | TaskItem بدون memo | إضافة React.memo مع المقارنة اليدوية | ✅ |
| 9 | new Date() مكرر 3 مرات | استخراج getToday() في constants | ✅ |
| 10 | صفحة 404 مفقودة | إضافة not-found.tsx | ✅ |
| 11 | صفحة Error مفقودة | إضافة error.tsx | ✅ |
| 12 | لا RTL ولا ترجمة عربية | dir=rtl, lang=ar, ترجمة كاملة لجميع النصوص | ✅ |
| 13 | خط عربي غير مناسب | استخدام Cairo من next/font | ✅ |
| 14 | يجب استخدام ml/mr في RTL | تحويل إلى ms/me/border-e/border-s/text-start | ✅ |
| 15 | التنقل Dashboard ↔ المهام لا يعمل | إضافة onViewChange('app') لكل nav item ومشروع | ✅ |
| 16 | حذف المشاريع غير موجود | إضافة زر حذف (×) بجانب كل مشروع مع confirm | ✅ |
| 17 | الضغط على المشروع لا يفتح عرض المهام | إضافة onViewChange('app') لزر المشروع | ✅ |
| 18 | الموقع لا يعمل على الموبايل — Sidebar ثابت | Sidebar يصبح overlay مع hamburger + backdrop | ✅ |
| 19 | TaskDetail لا يتكيّف مع الشاشات الصغيرة | يصبح full-screen على الموبايل | ✅ |
| 20 | أزرار صغيرة صعبة الضغط على الهاتف | تكبير `44px` touch target عبر `md:` breakpoints | ✅ |
| 21 | padding كبير على الموبايل | تقليل `px-6` → `px-4 md:px-6` | ✅ |
| 22 | أزرار الأولوية تفيض | `flex-col` على الموبايل + `sm:flex-row` | ✅ |
| 23 | CommandPalette لا يتكيّف | `px-4` + `pt-[10vh] sm:pt-[15vh]` | ✅ |
| 24 | الشعار نصي فقط (حرف "م") | SVG شعار متجهي: checkmark + "My Taske" (Google-style) | ✅ |
| 25 | شعار PNG غير متجهي | استبدال `ph.png` بـ `logo.svg` متجهي + إزالة `next/image` | ✅ |

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Framer Motion animations | Done | enter/exit, layoutId (TaskItem), slide (TaskDetail), scale (CommandPalette) |
| Focus Mode visual polish | Done | hides non-active tasks |
| Keyboard shortcut: N for new task | Done | focuses task input |
| Undo toast on delete | Backlog | react-hot-toast installed, not wired |
| `date-fns` dependency | Not used | installed but unused, kept for future |
| Static build warning: localStorage | Known | harmless, occurs during SSR |
| `public/ph.png` | Deprecated | replaced by `public/logo.svg` (can be deleted) |
| RTL animation direction | Done | TaskDetail slides from x:-20 (right in RTL) |
| Responsive design | Done | Mobile sidebar overlay, full-screen detail, 44px touch targets |
| SVG logo (Google-style) | Done | `public/logo.svg` — checkmark icon + "My Taske" text, scalable |
