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
│   │   ├── focus/
│   │   │   └── FocusMode.tsx      # Focus mode: Pomodoro (time-based timer) + YouTube audio + settings + dark UI
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx       # Draggable task card (React.memo)
│   │   │   ├── TaskList.tsx       # DnD context, add task input, filter display
│   │   │   └── TaskDetail.tsx     # Right panel: title, priority, date, etc.
│   │   ├── ui/
│   │   │   ├── Button.tsx         # ghost/primary/danger + sm/md/icon (44px touch on mobile)
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
│   │   └── useUIStore.ts          # Dark mode, focus mode, sidebar, activeTaskId, focusSession, focusSettings
│   │
│   ├── hooks/
│   │   └── useKeyboard.ts         # Global keyboard shortcuts (desktop-only, disabled on touch)
│   │
│   └── lib/                       # Shared core
│       ├── types.ts               # Task (pomodoroCount), Project, Priority, FilterType, FocusSession
│       ├── constants.ts           # PRIORITIES (Arabic), PROJECT_COLORS, STORAGE_KEYS (incl. FOCUS_SETTINGS), FOCUS_PRESETS, getToday()
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
    ├── F → toggleFocusMode (full-screen overlay)
    ├── Sidebar: "وضع التركيز" button → toggleFocusMode
    ├── FocusMode: Smart resume → restores last session from localStorage
    ├── FocusMode: Start/Pause → toggle timer
    ├── FocusMode: Reset → reset timer
    ├── FocusMode: Sound toggle → rain ambient on/off
    ├── FocusMode: Prev/Next → navigate tasks
    ├── FocusMode: ✓ complete → incrementPomodoro + trophy animation + chime
    ├── FocusMode: X → save session + exit
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
| 26 | لا يوجد وضع تركيز | FocusMode: Pomodoro 25/5 + صوت مطر + Dark UI + تنقل بين المهام | ✅ |
| 27 | Focus Mode لا يحفظ الحالة | Smart Resume: حفظ/استرجاع الجلسة من localStorage | ✅ |
| 28 | لا يوجد عداد جلسات Pomodoro | `pomodoroCount` لكل مهمة + عرض العدد في FocusMode | ✅ |
| 29 | لا يوجد feedback عند الإنجاز | Trophy animation + صوت احتفال عند إكمال جلسة | ✅ |
| 30 | لا يوجد smart task selection | اختيار تلقائي لأول مهمة غير مكتملة عند الدخول | ✅ |
| 31 | Focus Mode لا يظهر — لا يوجد زر مرئي | زر "وضع التركيز" في Sidebar + اختصار F | ✅ |
| 32 | لا يمكن تخصيص وقت البومودورو | Presets (25/5, 50/10, 90/20) + إدخال يدوي + حفظ في localStorage | ✅ |
| 33 | صوت مطر محلي فقط | استبدال بـ YouTube iframe — رابط خلفي + play/pause | ✅ |
| 34 | لا توجد إعداداتFocus Mode | Settings panel: مدة العمل/الاستراحة + رابط YouTube | ✅ |
| 35 | لا يوجد touch-action — double-tap zoom | `touch-action: manipulation` + `-webkit-tap-highlight-color` + `overscroll-behavior` | ✅ |
| 36 | keyboard shortcuts تعمل على الموبايل | تعطيل تلقائي على الأجهزة اللمسية via `matchMedia` | ✅ |
| 37 | أزرار صغيرة على الموبايل (< 44px) | تكبير جميع الأزرار لـ `min-h-[44px]` على الموبايل | ✅ |
| 38 | Focus Mode لا يتكيّف مع الشاشات الصغيرة | Timer أصغر + أزرار أكبر + settings panel يُمرّر | ✅ |
| 39 | حقل الإدخال مقطوع على الموبايل | إضافة `min-w-0` لـ flex containers لمنع القص | ✅ |
| 40 | Pomodoro timer يتجمد عند إخفاء التاب | وقت مطلق (`Date.now()`) بدلاً من التناقص | ✅ |

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Framer Motion animations | Done | enter/exit, layoutId (TaskItem), slide (TaskDetail), scale (CommandPalette) |
| Focus Mode visual polish | Done | Full-screen overlay: Pomodoro timer, rain sound, dark gradient, task nav |
| Focus Mode Pro | Done | Smart resume, pomodoro count, completion feedback (trophy + chime), session stats |
| Focus Mode Settings | Done | Custom durations (presets 25/5, 50/10, 90/20 + manual), YouTube background audio, settings panel |
| Keyboard shortcut: N for new task | Done | focuses task input |
| Undo toast on delete | Backlog | react-hot-toast installed, not wired |
| `date-fns` dependency | Not used | installed but unused, kept for future |
| Static build warning: localStorage | Known | harmless, occurs during SSR |
| `public/ph.png` | Deprecated | replaced by `public/logo.svg` (can be deleted) |
| RTL animation direction | Done | TaskDetail slides from x:-20 (right in RTL) |
| Responsive design | Done | Mobile sidebar overlay, full-screen detail, 44px touch targets |
| Cross-platform responsive | Done | touch-action, 44px targets, disabled mobile shortcuts, responsive FocusMode, scroll settings |
| SVG logo (Google-style) | Done | `public/logo.svg` — checkmark icon + "My Taske" text, scalable |
