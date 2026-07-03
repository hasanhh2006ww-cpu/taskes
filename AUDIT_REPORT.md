# Phase 1 — System Audit Report

## 📍 Site Map

```
/ (root) → redirects to /dashboard
├── /dashboard          # لوحة التحكم الرئيسية (Landing Page)
├── /tasks              # إدارة المهام (3-panel layout)
├── /habits             # متتبع العادات (Professional)
├── /calendar           # التقويم (Google Calendar-like)
├── /settings           # الإعدادات
└── /not-found          # صفحة 404
```

---

## 📋 Dashboard Structure (Current)

### Top Navigation (Sticky)
- Search Input (global)
- Theme Toggle (🌙/☀️)
- Notifications Bell
- User Avatar (placeholder "م")
- Primary CTA: "إضافة مهمة" → navigates to /tasks

### Row 1: Main Goal + Productivity Heatmap (2-col grid)
- **MainGoalCard**: Primary project goal with progress ring + AnimatedProgressBar
- **ProductivityHeatmap**: 30-day GitHub-style contribution grid

### Row 2-3: Left Column (3 cards stacked)
1. **ProductivityScoreCard**: Circular progress ring + label + progress bar
2. **WeeklyHeatmapView**: 4-week activity heatmap (Mon-Sun × 4 weeks)
3. **FocusSummaryCard**: 3 stats (Total Pomodoros, Total Focus Time, Today Sessions)

### Row 2-3: Right Column (stacked)
1. **Greeting + Date + Daily Quote**
2. **4 Stat Cards Grid** (1-col mobile, 2-col sm, 4-col lg):
   - مهام اليوم (emerald)
   - مكتملة اليوم (green)
   - جلسات تركيز (amber)
   - أيام العادات (rose)
3. **Progress Ring + Quick Actions** (2-col md):
   - Productivity Ring (completion rate)
   - Quick Actions Grid (6 buttons: Add Task, New Project, Focus, Calendar, Stats, Habits)
4. **Today's Tasks Card**: Clickable task list with toggle + priority dots
5. **Overdue Alert** (conditional): Rose-themed card
6. **Weekly Chart + Statistics Summary** (2-col md):
   - Weekly Bar Chart (SVG emerald bars)
   - Statistics Summary (4 stat boxes)

---

## 🧩 All Widgets / Components Inventory

### Layout Components
| Component | Location | Purpose |
|-----------|----------|---------|
| Sidebar | `components/layout/Sidebar.tsx` | Collapsible nav (mobile overlay, desktop fixed) |
| ClientLayout | `app/layout-client.tsx` | Root layout with sidebar, command palette, focus mode |

### Dashboard Widgets (all in `components/dashboard/Dashboard.tsx`)
| Widget | Lines | Description |
|--------|-------|-------------|
| MainGoalCard | 144-188 | Primary project goal with progress |
| ProductivityHeatmap | 190-257 | 30-day contribution grid |
| ProductivityScoreCard | 272-301 | Circular progress + score |
| WeeklyHeatmapView | 303-351 | 4-week activity heatmap |
| FocusSummaryCard | 353-380 | 3 focus stats grid |
| TodayTasksCard | 382-447 | Clickable task list |
| ProgressRing | 103-126 | Animated SVG circular progress |
| AnimatedProgressBar | 128-142 | Animated horizontal progress bar |
| WeekChart | 67-101 | Weekly bar chart (SVG) |
| Quick Actions | 890-918 | 6 action buttons grid |

### Pages & Main Views
| Page | Component | Key Features |
|------|-----------|--------------|
| Dashboard | `Dashboard.tsx` | Analytics, stats, heatmaps, quick actions |
| Tasks | `tasks/page.tsx` + `TaskList` + `TaskDetail` | 3-panel, DnD, filters, projects |
| Habits | `HabitTrackerPro.tsx` | 5 tabs, FAB, DnD reorder, inline edit, icon/color picker |
| Calendar | `CalendarView.tsx` | 4 views (month/week/day/agenda), task panel |
| Settings | `SettingsView.tsx` | Dark mode, focus presets, export/import, reset |

### UI Primitives (`components/ui/`)
| Component | Variants | Notes |
|-----------|----------|-------|
| Button | ghost/primary/danger, sm/md/icon | 44px touch target on mobile |
| Input | - | Minimal styled input |
| Badge | - | Priority badge |
| EmptyState | default/compact | With icon, title, description, action |
| IconPicker | - | 120+ icons, search, categories, Framer Motion |
| ColorPicker | - | 40+ colors, checkmark, glow, scale animation |
| HabitPreview | - | Live preview card |
| ConfirmDialog | - | Reusable confirmation modal |

### Feature Components
| Component | Location | Notes |
|-----------|----------|-------|
| TaskList | `components/tasks/TaskList.tsx` | DnD context, add input, filters |
| TaskItem | `components/tasks/TaskItem.tsx` | Draggable, swipe gestures, expand/collapse |
| TaskDetail | `components/tasks/TaskDetail.tsx` | Fixed drawer (Linear-style) |
| HabitTrackerPro | `components/habits/HabitTrackerPro.tsx` | Professional habit tracker |
| AddEditHabitModal | `components/habits/AddEditHabitModal.tsx` | Shared add/edit modal |
| CalendarView | `components/calendar/CalendarView.tsx` | 4 views, interactive |
| FocusMode | `components/focus/FocusMode.tsx` | Pomodoro, YouTube audio, smart suggest |
| CommandPalette | `components/command-palette/CommandPalette.tsx` | Ctrl+K, Arabic |

---

## 📊 Most Used Pages (Priority Order)
1. **Dashboard** — Landing page, visited every session
2. **Tasks** — Core daily interaction (CRUD, DnD, focus)
3. **Habits** — Daily habit tracking

## 📄 Secondary Pages
1. **Calendar** — Weekly/monthly planning
2. **Settings** — Occasional configuration

---

## 👤 User Flow (Critical Paths)

```
Landing (/dashboard)
    │
    ├── Search → (global search, not implemented fully)
    ├── + Add Task → /tasks (focus input)
    ├── Quick Actions → navigate to respective pages
    ├── Today's Tasks → toggle complete / click → TaskDetail drawer
    ├── Project Cards → filter tasks by project
    └── Stats Cards → scroll to statistics section
        │
        └── /tasks (Task Management)
            ├── Add Task (N key / + button)
            ├── Filter: All / Today / Important / Completed
            ├── Project filter (sidebar)
            ├── Drag to reorder
            ├── Click task → TaskDetail drawer (desktop) / full-screen (mobile)
            ├── Swipe right → complete, Swipe left → delete
            └── Expand → subtasks, description, activity log
        │
        └── /habits (Habit Tracking)
            ├── FAB → Add Habit Modal (name, type, frequency, icon, color)
            ├── Tabs: All / Daily / Weekly / Monthly / Statistics
            ├── Check circle → toggle completion
            ├── Double-click title → inline edit
            ├── Edit icon → Edit Modal
            ├── Trash → ConfirmDialog → delete
            ├── GripVertical → Drag reorder
            └── Statistics tab → progress, streaks, export/import
        │
        └── /calendar (Calendar)
            ├── Month / Week / Day / Agenda views
            ├── Click day → create task / show DaySummary
            ├── Click task → TaskDetail drawer
            └── Right panel: TaskDetail / DaySummary / Today+MiniCal+QuickActions
        │
        └── /settings (Settings)
            ├── Dark Mode toggle
            ├── Focus Duration presets + custom
            ├── YouTube background audio URL
            ├── Export/Import all data (JSON)
            └── Reset all (with confirmation)
```

---

## 🗑️ Duplicate / Redundant Elements

| Item | Location | Issue |
|------|----------|-------|
| `logo.svg` + `v1.png` | `public/` | Two logos, only v1.png used in Sidebar |
| `ph.png` | `public/` | Deprecated PNG logo |
| `EmptyState` (inline in Dashboard) | `Dashboard.tsx:657-691` | Duplicate of `components/ui/EmptyState.tsx` |
| `WeekChart` (inline) | `Dashboard.tsx:67-101` | Similar to chart in Statistics section |
| `ProgressRing` + `AnimatedProgressBar` | `Dashboard.tsx:103-142` | Could be shared UI primitives |
| `Button` variants | `Button.tsx` vs inline styles in Dashboard | Inconsistent (indigo primary vs emerald) |
| Priority colors | `constants.ts` (blue/amber/rose) vs `Dashboard.tsx` (emerald/amber/rose) | Mismatch |
| Card styles | `card-modern` (CSS) vs inline `card-modern` classes | Consistent but not tokenized |
| Focus mode trigger | Sidebar button + F key + Dashboard quick action | Multiple entry points (OK) |

---

## 📌 Important vs Non-Important Information

### High Priority (Keep & Polish)
- Dashboard analytics (score, heatmap, stats)
- Task management (CRUD, DnD, filters, projects)
- Habit tracking (types, streaks, customization)
- Calendar views (month/week/day/agenda)
- Focus mode (pomodoro, smart suggest, sounds)
- Dark mode + RTL + Arabic
- Responsive design (mobile sidebar, touch targets)

### Low Priority / Can Simplify
- Duplicate EmptyState implementations
- Inline chart components (consolidate)
- Multiple logo files
- Inconsistent color tokens (indigo vs emerald primary)
- Hardcoded spacing values throughout

---

## ❌ Current Errors / Issues (from PROJECT_MAP)

| # | Issue | Status |
|---|-------|--------|
| 43 | AI Assistant removed (orphans) | ❌ Backlog |
| 45 | Theme refresh incomplete | ✅ Done |
| 46 | Netlify plugin conflict | ✅ Fixed |
| 47 | AI Assistant fully removed | ❌ Backlog |
| 55 | Habit reorder drag | ✅ Done |
| 79 | Old tasks crash (subtasks/activityLog undefined) | ✅ Fixed |
| 80 | Supabase env vars + NaN guards | ✅ Fixed |
| 81 | Hydration mismatch (localStorage SSR) | ✅ Fixed |
| 82 | Habit rehydrate missing on /habits | ✅ Fixed |
| 83 | Full responsive audit | ✅ Done |
| 84 | RTL mobile sidebar drawer | ✅ Fixed |
| 85 | Mobile TaskDetail auto-open | ✅ Fixed |

---

## 🎯 Elements to Remove / Consolidate

1. **Delete**: `public/ph.png`, `public/logo.svg` (keep only `v1.png`)
2. **Consolidate**: Move `ProgressRing`, `AnimatedProgressBar`, `WeekChart`, `EmptyState` to `components/ui/`
3. **Tokenize**: All colors, spacing, radius, shadows in `globals.css` @theme
4. **Unify**: Button primary color (choose emerald, remove indigo)
5. **Standardize**: Priority colors (use constants.ts values everywhere)
6. **Remove**: Inline duplicate EmptyState in Dashboard.tsx
7. **Unify**: Card styles → single `card-modern` with design tokens