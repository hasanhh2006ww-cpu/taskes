# Stilldo — Project Map

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
│   ├── logo.svg                   # SVG logo (checkmark + Stilldo)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # RootLayout (Cairo font, dir=rtl, lang=ar)
│   │   ├── page.tsx               # Root → redirect to /dashboard
│   │   ├── tasks/
│   │   │   └── page.tsx           # Task list (3-panel layout + view routing)
│   │   ├── globals.css            # Tailwind v4 + RTL + dark mode
│   │   ├── not-found.tsx          # 404 page (Arabic)
│   │   └── error.tsx              # Error page (Arabic)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx        # Responsive: overlay mobile, fixed desktop + SVG logo + dark gradient bg
│   │   ├── focus/
│   │   │   └── FocusMode.tsx      # Focus mode: Pomodoro (time-based) + smart suggestion (keyword → duration) + YouTube audio + end sound selector + settings
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx       # Draggable task card (React.memo)
│   │   │   ├── TaskList.tsx       # DnD context, add task input, filter display
│   │   │   └── TaskDetail.tsx     # Right panel: title, priority, date, etc.
│   │   ├── habits/
│   │   │   ├── HabitTrackerPro.tsx    # Professional: daily/weekly/monthly + 5 tabs (الكل/يومي/أسبوعي/شهري/إحصائيات) + FAB + drag-reorder + inline edit + icon+color display
│   │   │   ├── AddEditHabitModal.tsx  # Modal مشترك للإضافة والتعديل: اسم، نوع، خيارات أسبوعية/شهرية، التحقق من التكرار + تخصيص العادة (أيقونة ولون)
│   │   │   ├── IconPicker.tsx        # معرض أيقونات 120+ مقسمة لفئات مع بحث و Framer Motion
│   │   │   ├── ColorPicker.tsx       # منتقي لون 40+ لون مع checkmark + glow + scale animation
│   │   │   ├── HabitPreview.tsx      # بطاقة معاينة حية للأيقونة واللون والاسم والنوع
│   │   │   └── ConfirmDialog.tsx     # نافذة تأكيد قابلة لإعادة الاستخدام: title + message + نعم/إلغاء
│   │   ├── ui/
│   │   │   ├── Button.tsx         # primary/secondary/ghost/danger + sm/md/lg/icon + loading spinner
│   │   │   ├── Badge.tsx          # default/success/warning/danger/info variants
│   │   │   ├── Input.tsx          # Input + Textarea with label, error, focus states
│   │   │   ├── Alert.tsx          # info/success/warning/danger with icon + close
│   │   │   ├── Select.tsx         # Styled select with label, error, chevron
│   │   │   ├── Skeleton.tsx       # Skeleton + SkeletonCard + SkeletonTable (animate-pulse)
│   │   │   └── EmptyState.tsx      # Icon + title + description + optional action button
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx      # Nature Inspired Green UI: Top Nav (باحث/🔔/🌿/➕→تنقل), 4 stats cards (emerald/green gradients + progress bars), recent tasks + project cards (قابلة للنقر→فلترة), weekly chart (SVG emerald bars), empty state (Sprout), Framer Motion, all buttons functional
│   │   ├── command-palette/
│   │   │   └── CommandPalette.tsx # Ctrl+K palette (Arabic)
│   │   └── calendar/
│   │       └── CalendarView.tsx    # Google Calendar-like: 4 views + interactive tasks (click → TaskDetail panel) + DaySummary + today's tasks/mini calendar/quick-actions sidebar
│   │
│   ├── store/                     # Zustand — domain-split
│   │   ├── useTaskStore.ts        # Tasks CRUD, filter, reorder (batch)
│   │   ├── useProjectStore.ts     # Projects CRUD
│   │   ├── useUIStore.ts          # Dark mode, focus mode, sidebar, activeTaskId, focusSession, focusSettings (incl. endSound/endSoundUrl)
│   │   └── useHabitStore.ts       # Habits CRUD, daily completion, streak calculation
│   │
│   ├── hooks/
│   │   └── useKeyboard.ts         # Global keyboard shortcuts (desktop-only, disabled on touch)
│   │
│   └── lib/                       # Shared core
│       ├── types.ts               # Task (pomodoroCount), Project, Priority, FilterType, FocusSession, Habit
│       ├── constants.ts           # PRIORITIES (Arabic), PROJECT_COLORS, STORAGE_KEYS (incl. FOCUS_SETTINGS, HABITS), FOCUS_PRESETS, getToday()
│       ├── habitIcons.ts          # 120+ أيقونة عادات مقسمة لفئات + 43 لون + getHabitIcon/getIconByName utility
│       ├── focus-suggest.ts       # Smart focus suggestion engine + END_SOUNDS + playBell/playBeep/playEndSound
│       ├── cn.ts                  # clsx + twMerge utility
│       ├── logger.ts              # Async non-blocking logger
│       └── storage.ts             # loadFromStorage / saveToStorage
│
├── PROJECT_MAP.md
├── netlify.toml                    # Build config: npm run build → out/, SPA redirects
├── public/
│   ├── _redirects                  # SPA fallback (processed by Netlify at deploy time)
│   └── _headers                    # Cache control: no-cache for index.html, immutable for /_next/static/*
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
    ├── Sidebar click (Habits) → onViewChange('habits') + close sidebar
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
    ├── FocusMode: Smart suggestion → keyword analysis of task title → banner with accept/dismiss
    ├── FocusMode: Accept suggestion → update workMin + timer duration
    ├── FocusMode: Sound toggle → rain ambient on/off
    ├── FocusMode: End sound → plays selected sound (chime/bell/beep/celebration/custom) on timer end
    ├── FocusMode: Prev/Next → navigate tasks
    ├── FocusMode: ✓ complete → incrementPomodoro + trophy animation + chime
    ├── FocusMode: X → save session + exit
    ├── HabitTrackerPro: FAB → showAddModal(true) → AddEditHabitModal (add mode)
    ├── HabitTrackerPro: Check circle → toggleDailyCompletion / toggleWeeklyCompletion / toggleMonthlyCompletion
    ├── HabitTrackerPro: Double-click title → inline edit (title only)
    ├── HabitTrackerPro: Edit icon (✏️) → setEditHabit(habit) → AddEditHabitModal (edit mode: name, type, frequency)
    ├── HabitTrackerPro: Trash icon → setDeleteConfirmId → ConfirmDialog: "نعم" → deleteHabit
    ├── HabitTrackerPro: GripVertical icon in header → toggle isReordering → DndContext + SortableContext → onDragEnd → reorderHabits
    ├── HabitTrackerPro: Tab "إحصائيات" → computeStats: progress bar daily, per-type details, best streak, export/import buttons
    ├── HabitTrackerPro: Export → exportData() → Blob → download JSON
    ├── HabitTrackerPro: Import → file input → read JSON → importData() → toast success/error
    ├── HabitTrackerPro: Display streaks → current (🔥) + best (🏆)
    └── Theme button → toggleDarkMode
            │
            ▼
    Zustand Store → saveToStorage() ← auto-save on every mutation
                  → React re-render (selective via selectors + React.memo)
```

## [FIXES & IMPROVEMENTS]

| # | المشكلة | الإجراء | الحالة |
|---|---------|--------|--------|
| 61 | واجهة قديمة وبسيطة — UI/UX Premium Redesign | جراحة تجميلية شاملة: Sidebar عائم (Linear-inspired) مع rounded-2xl + glass + floating shadow، Dashboard جديد (hero ring + 4 stat cards + quick actions + timeline + statistics section + motivational quote + theme toggle + profile avatar في الـ top nav)، TaskItem حديث مع hover elevation + animated check + project badge، CalendarView شبيه TickTick (dots + day selection + task panel)، FocusMode أكثر minimal، globals.css أضيف glass/floating/card-shadow/card-hover + animate-float، خط IBM Plex Sans Arabic مضاف، Empty states محسّنة مع spring animations، SettingsView مع glass cards + motion dialog | ✅ |
| 62 | Sidebar ثابت بلا تأثير عائم | تحويل إلى floating glass card مع rounded-2xl + floating shadow + حشوة p-1 في الحاوية + scale icons عند active + pills دائرية للعدادات + bottom section glass | ✅ |
| 63 | Dashboard قديم (Nature Green) | إعادة كاملة: greeting + quote تحفيزية + 4 بطاقات (مهام اليوم/مكتملة/تركيز/عادات) مع gradient icons + hero progress ring (SVG animated) + progress bar + 6 quick actions grid + نشاط أخير (timeline) + ملخص إنتاجية (4 stats) + weekly chart + تنبيه المتأخرات + empty state محسّن | ✅ |
| 64 | CalendarView بسيط | TickTick-like: day cells مع dots بدلاً من text slices, selected day تسليط ضوء + task panel, smooth transitions, dark mode محسّن | ✅ |
| 65 | لا يوجد خط IBM Plex Sans Arabic | إضافة via next/font/google في layout.tsx + تعيينه كـ font-family الأساسي | ✅ |
| 66 | Empty state TaskList قديم | إعادة بتصميم animated: icon container gradient + spring scale + fade-in text بالترتيب | ✅ |
| 67 | Settings بدون glass effect | إضافة backdrop-blur-sm و card-hover لكل SettingCard + motion للـ reset dialog | ✅ |
| 68 | FocusMode خلفية ثقيلة | تهدئة التدرج إلى  from-[#0A0E17] via-zinc-950 to-[#0A0E17] بدلاً من indigo | ✅ |


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
| 24 | الشعار نصي فقط (حرف "م") | SVG شعار متجهي: checkmark + "Stilldo" (Google-style) | ✅ |
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
| 41 | لا يوجد اقتراح ذكي لمدة التركيز | `suggestFocus()` يحلل عنوان المهمة ويقترح 25/50/90 دقيقة مع Banner قبول/تجاهل | ✅ |
| 42 | لا يوجد اختيار صوت نهاية الجلسة | 5 خيارات (نغمة بسيطة، جرس، تنبيه رقمي، احتفال، رابط مخصص) + مشغل عند انتهاء التايمر | ✅ |
| 43 | لا يوجد مساعد ذكي لتحويل الأهداف إلى مهام | AIAssistant: rules engine + واجهة إدخال الهدف ← خطة يومية ← إضافة مهام للـ store | ❌ |
| 44 | لا يوجد تحكم بالإيماءات (Swipe) | TaskItem: pointer-event swipe → right=complete, left=delete + vibration + بهدوء | ✅ |
| 45 | الثيمة الداكنة بسيطة جداً (مسطحة) | Modern SaaS dark theme: gradient bg (from-[#0A0E17] via-[#111827] to-[#020617]), refined borders, card hover lift, sidebar gradient, Linear-inspired | ✅ |
| 46 | التحديثات لا تظهر في الموقع المباشر | @netlify/plugin-nextjs يمنع static export; إزالة الـ plugin + إضافة public/_redirects + public/_headers للتحكم بالتخزين المؤقت | ✅ |
| 47 | المساعد الذكي (AI) تمت إزالته بالكامل | حذف AIAssistant.tsx + ai-engine.ts + 'ai' view + إزالة addMultipleTasks orphan + update PROJECT_MAP | ❌ |
| 48 | لا يوجد متتبع عادات (Habit Tracker) | HabitTracker: daily habits + checkbox + streak (🔥) + CRUD + reorder + sidebar nav + localStorage | ✅ |
| 49 | متتبع العادات المعزز | HabitTracker: mini calendar + 7-day status + current/best streak + streak broken alerts + interactive day clicks | ✅ |
| 50 | متتبع العادات الاحترافي (إعادة كتابة) | UI نظيف: شريط تبويبات 4 (الكل/يومي/أسبوعي/شهري)، بطاقات مبسطة (اسم + نوع + أيام التكرار + ستريك)، فرز حسب تاريخ الإضافة (الأحدث أولاً)، إزالة النموذج المدمج + إزالة النصوص الصلبة (HabitConfigPanel/getStreakMessage)، بقاء FAB والمودال | ✅ |
| 51 | زر "+" دائري FAB + مودال الإضافة | زر أخضر دائري (أسفل اليمين) يفتح Modal لإضافة عادة: اسم، نوع (يومي/أسبوعي/شهري)، خيارات أسبوعية/شهرية، التحقق من عدم التكرار، حفظ فوري | ✅ |
| 52 | WeeklyHabit/MonthlyHabit ناقصين `createdAt` و `order` | إضافة الحقلين إلى type definitions (كان المكون يضبطهما في store لكن TypeScript يمنع الوصول) | ✅ |
| 53 | تعديل العادات (Edit Habit Modal) | مودال تعديل مشابه للإضافة لكن معبأ ببيانات العادة + يدعم تغيير النوع وإعادة ضبط الحقول | ✅ |
| 54 | حذف عادة مع تأكيد (Delete Confirm) | ConfirmDialog: "هل أنت متأكد من حذف عادة X؟" مع خيارين "نعم"/"إلغاء" + toast نجاح | ✅ |
| 55 | إعادة ترتيب العادات (Drag & Drop) | زر GripVertical في الهيدر → تفعيل DndContext + SortableContext + useSortable مع حفظ الترتيب في الـ store | ✅ |
| 56 | إحصائيات العادات (Statistics Tab) | تبويب خامس "إحصائيات": شريط تقدم يومي، تفاصيل كل نوع، أفضل ستريك، زر تصدير/استيراد | ✅ |
| 57 | تصدير / استيراد البيانات (JSON) | تصدير كل الـ store إلى ملف JSON + استيراد مع تأكيد وtoast نجاح/فشل | ✅ |
| 58 | تعديل الفرز من createdAt إلى order | تغيير ترتيب العرض من `b.createdAt - a.createdAt` إلى `a.order - b.order` ليدعم drag-reorder | ✅ |
| 59 | إعادة تصميم Dashboard (Ultra Modern Light SaaS) | Top Nav (search, bell, avatar, +Add Task), 4 Stats Cards مع gradient/progress, Recent Tasks + Projects, نشاط أسبوعي (SVG bar chart), empty state, Framer Motion animations | ✅ |
| 60 | إعادة تصميم Dashboard (Nature Inspired Green UI) | تحويل الألوان إلى درجات الأخضر الطبيعي: emerald/green/mint بدلاً من blue/cyan، أيقونات Leaf/Sprout، تفعيل جميع الأزرار (➕ Add Task → تنقل إلى المهام، 🔔 → toast, projects → فلترة حسب المشروع) | ✅ |
| 61 | Dashboard 3-Column Grid Layout (SaaS Professional) | تحويل Dashboard إلى لوحة تحكم احترافية بـ 3 أعمدة: عمود أيسر (Productivity Score + Weekly Heatmap + Focus Summary + Recent Activity)، عمود أوسط (Greeting + 4 Stat Cards + Progress Ring + Quick Actions + Today's Tasks + Overdue Alert + Weekly Chart + Statistics)، وعمود أيمن (Sidebar من الـ Layout)، glass cards + card-hover + floating shadows + AnimatedProgressBar + smooth layout animations، Responsive: Desktop=3cols / Tablet=2cols / Mobile=1col | ✅ |
| 62 | Main Goal Card | إضافة بطاقة "الهدف الرئيسي" في الصف الأول من Dashboard. تعرض الهدف المستنتج من أول مشروع غير فارغ (أو أكبر مشروع مهام)، مع نسبة الإنجاز، المهام المتبقية، الموعد النهائي. Glass card + Target icon + AnimatedProgressBar + Framer Motion. | ✅ |
| 63 | Productivity Heatmap (30-day) | إضافة خريطة إنتاجية حرارية شبيهة بـ GitHub Contributions في الصف الأول من Dashboard. تعرض آخر 30 يوماً من إنجاز المهام بـ 4 مستويات ألوان (رمادي/أخضر فاتح/متوسط/قوي). Hover tooltip مع التاريخ وعدد المهام. Stagger animation للمربعات. | ✅ |
| 64 | Rebrand: My Taske → Stilldo | إعادة تسمية التطبيق بالكامل من "My Taske" إلى "Stilldo" في جميع الواجهات: title/description في layout.tsx، alt في Sidebar.tsx، نص SVG في logo.svg، PROJECT_MAP.md. بدون تغيير الشعار أو التصميم. | ✅ |
| 65 | Logo Redesign — Premium SaaS Brand Mark | إعادة تصميم logo.svg بالكامل: شكل "S" متدفق بـ teal-to-emerald gradient + ورقة في المنحنى السفلي + 3 نجوم لامعة (4-pointed stars) على خلفية داكنة م rounded. تصميم premium متجهي (SVG) قابل للتصغير لأيقونة المتصفح والشريط الجانبي والتطبيق. | ✅ |
| 67 | Sidebar branding too small (logo h-7, no text) | استبدال logo.svg بـ v1.png (h-12 expanded / h-9 collapsed) + إضافة نص "Stilldo" بخط font-extrabold tracking-wide + ربط العلامة التجارية بالكامل كـ Link إلى /dashboard مع hover scale+shadow+transition + تسجيل تنقل عبر logger | ✅ |
| 68 | Root route "/" shows Task page instead of Dashboard | تغيير / من عرض المهام إلى redirect إلى /dashboard عبر router.replace + إنشاء /tasks ونقل صفحة المهام إليها + تحديث Sidebar (روابط التصفية والمشاريع) من / إلى /tasks + إضافة تسجيل redirect عبر logger | ✅ |
| 69 | "إنشاء أول مهمة" و"إضافة مهمة" في Dashboard لا تعمل بعد تغيير التوجيه | تغيير 3 occurrences من `router.push('/')` إلى `router.push('/tasks')` في Dashboard.tsx: goToTasks (سطر 567), goToTasksWithProject (سطر 575), ومشروع جديد (سطر 881) | ✅ |
| 70 | إعادة تصميم التقويم (Google Calendar-like) | إعادة كتابة CalendarView.tsx بالكامل: 4 أوضاع عرض (شهر/أسبوع/يوم/جدول)، شريط علوي مع Today+تنقل+مغير عرض، خلايا أيام تعرض المهام والعادات، نافذة إنشاء مهمة بالضغط على يوم، لوحة جانبية لتفاصيل اليوم المحدد، تصميم Full-Screen، أنماط Google Calendar، تسجيل عبر logger | ✅ |
| 71 | تحسين تباين وعرض المهام في التقويم (Calendar Events Styling) | توحيد نمط بطاقات المهام عبر جميع أوضاع العرض (Month/Week/Day/Agenda/Details): bg-teal-50 + border-r-4 border-teal-500 + text-teal-700 في الوضع المضيء، dark:bg-teal-950/40 + dark:border-teal-400 + dark:text-teal-300 في المظلم، rounded-md + font-medium + hover:brightness, إزالة PRIORITY_COLORS و isSameDay غير المستخدمين | ✅ |
| 72 | نظام التفاعل مع المهام في التقويم & لوحة جانبية ذكية (Calendar Interaction System) | 3 مراحل: (1) جعل كل بطاقة مهمة قابلة للنقر (`cursor-pointer` + `stopPropagation` + `setActiveTaskId`) عبر MonthView / WeekView / DayView / AgendaView مع hover effects + ring للإختيار; (2) استبدال DayDetails القديم بـ CalendarRightPanel الذكي: يُظهر TaskDetail عند اختيار مهمة (وضع تعديل كامل)، DaySummary مع checkbox/toggle عند اختيار تاريخ، ولوحة Today's Tasks + Mini Calendar + Quick Actions عند عدم اختيار شيء; (3) تسجيل كل تفاعل عبر logger + تكامل مع useTaskStore / useProjectStore + إزالة updateTask/deleteTask/Button غير المستخدمين | ✅ |
| 73 | تخصيص العادات (Habit Customization) — أيقونة + لون لكل عادة | إضافة `icon` و `color` إلى DailyHabit/WeeklyHabit/MonthlyHabit في types.ts + إنشاء `habitIcons.ts` (120+ أيقونة مقسمة لفئات: رياضة/صحة/تعلم/إنتاجية/مال/روحانيات/إبداع/نمط حياة/سفر/اجتماعي/تقنية/سلبيات) + `IconPicker.tsx` (معرض أيقونات مع بحث وتصنيفات قابلة للطي وFramer Motion) + `ColorPicker.tsx` (40+ لون، دوائر مع checkmark متحرك + glow + ring-color عبر CSS variable) + `HabitPreview.tsx` (بطاقة معاينة حية) + دمج كل ذلك في `AddEditHabitModal.tsx` تحت قسم "تخصيص العادة" + تحديث `HabitTrackerPro.tsx` (SortableHabitCard + البطاقات الرئيسية) لعرض الأيقونة واللون المختار + تحديث `CalendarView.tsx` (3 نقاط عرض عادات) لاستخدام getHabitIcon واللون المخصص بدلاً من Flame الثابت + قيم افتراضية (Flame / #f59e0b) في useHabitStore.addHabit + تمرير icon/color عبر options في save/edit + إزالة استيرادات غير مستخدمة | ✅ |
| 74 | Habit Modal Responsive Fix | إصلاح تخطيط AddEditHabitModal ليكون Responsive: max-w-lg→w-[95vw]/md:max-w-2xl/lg:max-w-3xl + max-h محدودة + flex-col + overflow-hidden + scrollable body (overflow-y-auto) + sticky footer للازرار (bg-white border-t backdrop-blur) + تقليل المسافات (mb-4→3, space-y-3→2, p-3→2.5) + IconPicker grid-cols-4/md:6/lg:8 + ColorPicker grid-cols-7/sm:8 gap متجاوب | ✅ |
| 75 | Premium Habit Cards UI/UX (Apple Health + Notion + Habitify Style) | تحويل بطاقات العادات إلى Cards احترافية: responsive grid (grid-cols-1/md:2/lg:3) مع gap-3، hover effects (shadow-lg + translate-y-0.5) مع group، hoist hColor/Icon/progress خارج IIFEs، إضافة progress bar (h-1.5 rounded-full بلون العادة)، عرض الوصف (description) تحت الاسم، دائرة أيقونة h-11 w-11 rounded-xl، تغيير alignment إلى items-start، celebration ring (ring-2 ring-offset-2 مع --tw-ring-color) عند إكمال العادة لمدة 700ms، getProgressPercent: daily/weekly 0/100%، monthly (done/target)*100، تحديث SortableHabitCard بنفس التصميم premium (hover:shadow-md + h-11 rounded-xl) | ✅ |
| 76 | TaskDetail → Fixed Drawer (Linear/Notion-style) | تحويل TaskDetail من flex-child column إلى fixed drawer مستقل: `fixed inset-y-0 left-0 z-50` + backdrop `bg-black/20 backdrop-blur-sm` + responsive عرض (`w-full` / `sm:w-[420px]` / `lg:w-[460px]`) + `h-screen` + header ثابت (title + status + close), content scrollable (`flex-1 overflow-y-auto`), footer ثابت (focus + star + delete) + spring slide-in من اليسار + إزالة غلاف `w-full md:w-80` من tasks/page.tsx + إزالة motion.div بعرض متحرك من CalendarView.tsx + إزالة `hidden md:flex` عن task list عند فتح التفاصيل (الدراور يغطي ويدعم backdrop) | ✅ |
| 77 | فصل add mode عن view mode في TaskDetail Drawer | إصلاح مشكلة ظهور backdrop/blur عند إضافة مهمة جديدة: فصل `showDetailPanel` إلى `showAddPanel` (`isAdding && !activeTaskId`) و `showTaskView` (!!activeTaskId). Add mode يُرَندَر كـ side panel جزء من Layout (`w-full md:w-80` بدون fixed/backdrop). View mode يبقى كـ fixed drawer مع backdrop. | ✅ |
| 78 | Expand/Collapse Task Items | إضافة expand/collapse لكل مهمة عبر زر ChevronDown: يعرض الوصف (description)، المهام الفرعية (subtasks مع toggle inline)، وآخر 3 نشاطات (activity log). يُحفظ حالة التوسيع في localStorage عبر `STORAGE_KEYS.EXPANDED_TASKS`. استخدام `layout` + fade-in لحركة سلسة بدون `height: auto`. تسجيل عبر logger. | ✅ |
| 79 | Fix: page crash on old tasks without subtasks/activityLog | المهام القديمة في localStorage قد لا تحتوي على `subtasks` أو `activityLog` → `Cannot read properties of undefined (reading 'length')` في TaskItem.tsx سطر 240 و 270. الإصلاح: استخدام `task.subtasks ?? []` و `task.activityLog ?? []` في كل نقاط الوصول داخل TaskItem.tsx. | ✅ |
| 80 | Supabase Client + Next.js env vars + NaN guards | تصحيح بيئة Supabase: (1) تغيير `.env` من `VITE_APP_*` (Vite) إلى `NEXT_PUBLIC_*` (Next.js). (2) إعادة كتابة `supabase.ts` باستخدام `process.env` مع التحقق من وجود المتغيرات ورسائل خطأ واضحة. (3) إضافة حواجز NaN في Dashboard: `ProgressRing` (`Number.isFinite` + clamp [0,100])، `AnimatedProgressBar` (`Number.isFinite` لـ value/max)، `WeekChart` (تعقيم جميع قيم total/done). (4) إزالة `import.meta.env` نهائياً. | ✅ |
| 81 | Hydration mismatch + SSR localStorage fix | جميع الـ Zustand stores كانت تقرأ `localStorage` على مستوى الملف (module scope) → SSR ترجع `[]` و client ترجع البيانات الحقيقية → `isEmpty` تختلف → شجرتين مختلفتين بالكامل (Empty State vs Dashboard). الإصلاح: (1) إزالة `loadFromStorage` من module scope في كل الـ 4 stores واستبدالها بقيم افتراضية فارغة. (2) إضافة `rehydrate()` method لكل store تقرأ من localStorage وتحدث الحالة. (3) Dashboard تستدعي `rehydrate()` في `useEffect` بعد hydration. (4) Dashboard دائماً ترسم نفس الشجرة (بدون `isEmpty` conditional)، ويظهر الـ empty state كبطاقة داخل الـ dashboard عند عدم وجود بيانات. | ✅ |
| 82 | Habit store rehydrate missing on /habits page | commit 1737f05 أزال module-level loadFromStorage وأضاف rehydrate() لكن `useHabitStore.rehydrate()` لم يُستدعَ إلا في Dashboard فقط. العادات تضاف في الجلسة لكنها تختفي عند التحديث. الإصلاح: إضافة `useEffect → useHabitStore.getState().rehydrate()` في HabitTrackerPro.tsx | ✅ |
| 84 | RTL Mobile Sidebar Drawer Fix | استبدال `style={{ width }}` بـ Tailwind classes + تصحيح اتجاه translate-x في RTL + ثلاث وضعيات (موبايل/تابلت/ديسكتوب) | ✅ |
| 85 | Mobile TaskDetail Auto-Open Fix — لا تفتح تفاصيل المهمة تلقائيًا على الهاتف | إزالة `activeTaskId` من `addTask` في useTaskStore + إضافة return `newTask.id`. في TaskList: بعد الإضافة، سطح المكتب يفتح `setActiveTaskId`، الموبايل يطمس الإدخال (`blur`). في TaskItem: الضغط على نص المهمة يوسعها بدلاً من فتح التفاصيل، وزر "التفاصيل" يظهر فقط على الموبايل. إضافة `onBlur` handler لـ `isAdding` في page.tsx. CalendarView: إضافة `setActiveTaskId` بعد `addTask` للحفاظ على سلوك سطح المكتب. | ✅ |
| 86 | Design System v2 — unified tokens & simplified CSS | تحديث `design-tokens.ts`: توحيد الألوان (primary #16A34A, success/warning/error/info مع dark/light)، تبسيط shadows إلى 3 (small/medium/large)، إزالة tokens غير المستخدمة. تحديث `globals.css`: إضافة CSS custom properties (--ds-primary, --ds-surface, --ds-border, --ds-shadow-*), دمج 4 أنظمة كروت في نظام واحد (card-base)، استخدام primary بدلاً من indigo في selection/focus, الحفاظ على backward compatibility للـ card-modern. | ✅ |
| 87 | Layout Restructure — Topbar مشترك لكل الصفحات | نقل Topbar من كونه جزءاً من Dashboard فقط إلى `layout-client.tsx` ليكون مشتركاً عبر جميع الصفحات (dashboard, tasks, calendar, habits, settings). إزالة الـ TopNav المكرر من Dashboard.tsx (search, bell, theme, avatar, +). تعديل layout: إضافة `<Topbar />` + `<main>` داخل flex container مع `flex-1`. | ✅ |
| 88 | Dashboard Redesign — إعادة هيكلة كاملة | إعادة ترتيب Dashboard حسب المواصفات: Welcome → Quick Actions → Statistics → Charts → Today's Tasks → Recent Activity → Announcements → Calendar Mini. إزالة الـ widgets المكررة (MainGoalCard, ProductivityHeatmap, ProductivityScoreCard, WeeklyHeatmapView, FocusSummaryCard). إضافة Announcements (3 بطاقات: نصيحة اليوم/تحدي الأسبوع/إنتاجية جماعية). إضافة MiniCalendar. استخدام `card-base` بدلاً من `card-modern` في الأماكن الجديدة. | ✅ |

| 89 | Phase 5 — Button enhancement | إضافة variant `secondary` (bg-zinc-100/dark:bg-zinc-800) + size `lg` + خاصية `loading` (spinner SVG مع animate-spin + تعطيل تلقائي). تغيير التركيز الافتراضي من indigo إلى emerald (primary). | ✅ |
| 90 | Phase 5 — Badge enhancement | إضافة 5 variants (`default`/`success`/`warning`/`danger`/`info`) مع ألوان مخصصة لكل منها في الوضعين الفاتح والمظلم. | ✅ |
| 91 | Phase 5 — Input + Textarea enhancement | تحويل Input إلى `forwardRef` مع label + error + border + focus ring (emerald). إضافة `Textarea` component (resize-y, min-h-[80px]). تحسين التباين في dark mode. | ✅ |
| 92 | Phase 5 — Alert component | إنشاء `Alert.tsx`: 4 variants (info/success/warning/danger) مع أيقونة Lucide مناسبة + عنوان + وصف + زر إغلاق اختياري. | ✅ |
| 93 | Phase 5 — Select component | إنشاء `Select.tsx`: `forwardRef` مع label + error + placeholder + خيارات + أيقونة ChevronDown مخصصة + border/focus ring. | ✅ |
| 94 | Phase 5 — Skeleton loading | إنشاء `Skeleton.tsx`: `Skeleton` (animate-pulse + rounded-md)، `SkeletonCard` (border + p-4 + 3 أسطر)، `SkeletonTable` (5 صفوف قابلة للتخصيص). | ✅ |
| 95 | Phase 9 — Auto dark mode (system preference) | إضافة `themeMode: 'light' | 'dark' | 'auto'` إلى useUIStore. `toggleDarkMode` يدور بين light→dark→auto. `applyTheme()` تستخدم `window.matchMedia('prefers-color-scheme: dark')` في الوضع auto. Topbar و Sidebar يعرضان أيقونة Monitor للوضع auto مع نص "تلقائي". layout-client يستمع لتغييرات system preference عبر addEventListener('change'). | ✅ |
| 96 | Phase 11 — Accessibility improvements | تغيير focus-visible ring من indigo-500 إلى emerald-500 في Button و Input و Select و Topbar و Sidebar. إضافة `aria-invalid` + `aria-describedby` لـ Input/Textarea/Select. إضافة `role="alert"` في Alert ورسائل الخطأ. توحيد `aria-label` لجميع الأزرار. | ✅ |

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Framer Motion animations | Done | enter/exit, layoutId (TaskItem), slide (TaskDetail), scale (CommandPalette) |
| Enhanced Habit Tracker UI | Done | mini calendar, 7-day status, current/best streak, broken streak alerts |
| Focus Mode visual polish | Done | Full-screen overlay: Pomodoro timer, rain sound, dark gradient, task nav |
| Enhanced Habit Tracker UI | Done | mini calendar, 7-day status, current/best streak, broken streak alerts |
| Professional Habit Tracker | Done | daily/weekly/monthly types, tab filters, timezone-aware, advanced streak logic, config panels |
| Focus Mode Pro | Done | Smart resume, pomodoro count, completion feedback (trophy + chime), session stats |
| Focus Mode Settings | Done | Custom durations (presets 25/5, 50/10, 90/20 + manual), YouTube background audio, settings panel |
| Smart Focus Suggestion | Done | `suggestFocus(title)` → keyword-based 25/50/90 min suggestion with accept/dismiss banner |
| End Sound System | Done | 5 sounds (chime, bell, beep, celebration, custom URL), plays automatically on timer end |
| Gesture Controls (Swipe) | Done | TaskItem: pointer-event swipe → right=complete, left=delete + vibration + spring animation |
| Theme Refresh (SaaS Dark) | Done | Gradient body/sidebar/cards, hover lift effects, refined borders, indigo glow |
| Deployment Fix | Done | Removed @netlify/plugin-nextjs (conflicts with static export), added public/_redirects + public/_headers |
| Keyboard shortcut: N for new task | Done | focuses task input |
| Undo toast on delete | Backlog | react-hot-toast used for delete/import/export success/error toasts, no undo yet |
| `date-fns` dependency | Not used | installed but unused, kept for future |
| Static build warning: localStorage | Fixed | removed module-level loadFromStorage calls, stores hydrate via rehydrate() in useEffect |
| `public/ph.png` | Deprecated | replaced by `public/logo.svg` (can be deleted) |
| `src/components/habits/HabitTracker.tsx` | Deleted | old habit tracker, replaced by HabitTrackerPro, no imports remained |
| RTL animation direction | Done | TaskDetail slides from x:-20 (right in RTL) |
| Daily habit completion with calendar selection | Done | HabitTracker now allows clicking any day in the 7-day calendar to toggle completion |
| Responsive design | Done | Mobile sidebar overlay, full-screen detail, 44px touch targets |
| Cross-platform responsive | Done | touch-action, 44px targets, disabled mobile shortcuts, responsive FocusMode, scroll settings |
| SVG logo (Google-style) | Done | `public/logo.svg` — checkmark icon + "Stilldo" text, scalable |
| Edit Habit Modal (AddEditHabitModal) | Done | shared add/edit modal, type-change reconstruction, duplicate-name check |
| Delete Confirm Dialog (ConfirmDialog) | Done | reusable confirmation modal with toast feedback |
| Habit Drag-and-Drop Reorder | Done | DndContext + SortableContext + useSortable, GripVertical handle-only activation |
| Habit Statistics Tab | Done | per-type completion counts, daily progress bar, best streak display, export/import buttons |
| Habit Export/Import | Done | JSON Blob download, file reader upload + store replace, error handling |
| Dashboard Redesign #1 (Blue SaaS) | Done | ultra-modern light SaaS: blue gradient stats, weekly chart, project cards |
| Dashboard Redesign #2 (Green Nature) | Done | emerald-green nature palette, Leaf avatar, Sprout empty state, functional buttons |
| Full Website UI Redesign – Part 1 | Done | collapsible sidebar (w-16/w-64), green theme, tooltips, Calendar/Settings nav items |
| Full Website UI Redesign – Part 2 | Done | page.tsx: AnimatePresence transitions, sidebar-collapse-aware layout, CalendarView + SettingsView routing |
| CalendarView | Done | month grid calendar with day numbers, task dots, emerald today indicator, task slices per day |
| SettingsView | Done | dark mode toggle, focus duration presets, import/export all data, reset all with confirm dialog |
| TaskItem Green Refresh | Done | emerald active border/ring, emerald hover states, emerald check icon |
| Sidebar Layout Fix | Done | inline style width (70/260px) for smooth animation, shrink-0, md:translate-x-0, md:relative, handleNavClick desktop-safe |
| Professional Dashboard | Done | Smart greeting (time-aware), 4 stat cards (today/completed/focus/habits), animated progress card, quick actions grid, productivity summary, enhanced empty state with feature highlights |
