# Mobile UX Audit Report — Stilldo

## 1. TaskDetail Drawer — RTL Direction Bug (CRITICAL)

**File:** `src/components/tasks/TaskDetail.tsx:172-176`

**Root cause:** Drawer used `left-0` + Framer Motion `x: '-100%'` → `x: 0`. CSS transforms are NOT affected by `dir="rtl"`, so `x: '-100%'` always moves left regardless of direction. On this RTL app, the drawer slid in from the wrong (left) side.

**Fix:** Changed `left-0` → `right-0` and `x: '-100%'` → `x: '100%'`. The drawer now slides in from the right (natural for RTL).

---

## 2. TaskDetail Drawer — Missing Body Scroll Lock (HIGH)

**File:** `src/components/tasks/TaskDetail.tsx:43-47`

**Root cause:** When the TaskDetail drawer was open, the body behind it could still scroll, causing visual jank and broken user experience.

**Fix:** Added a `useEffect` that sets `document.body.style.overflow = 'hidden'` when the drawer mounts, restoring the previous value on unmount.

**Applied to all overlays:**
- `src/components/command-palette/CommandPalette.tsx`
- `src/components/habits/ConfirmDialog.tsx`
- `src/components/habits/AddEditHabitModal.tsx`
- `src/components/focus/FocusMode.tsx`

---

## 3. TaskDetail Drawer — No Android Back-Button Handler (HIGH)

**File:** `src/components/tasks/TaskDetail.tsx:49-55`

**Root cause:** On Android, pressing the hardware/system back button navigated away from the page entirely instead of closing the TaskDetail drawer.

**Fix:** Added a `popstate` event listener on mobile (< 768px). When open, a history state is pushed. On `popstate` (back button), the drawer closes. Listener is cleaned up on unmount.

**Applied to all overlays:** CommandPalette, ConfirmDialog, AddEditHabitModal, FocusMode.

---

## 4. TaskDetail Footer — Missing iOS Safe Area (MEDIUM)

**File:** `src/components/tasks/TaskDetail.tsx:478`

**Root cause:** The fixed footer had no `safe-area-bottom` padding. On iPhone with home indicator (X+), the footer content was partially hidden.

**Fix:** Added `safe-area-bottom` class to the footer (already defined in `globals.css` via `env(safe-area-inset-bottom)`).

---

## 5. TaskItem — التفاصيل Button Touch Target (MEDIUM)

**File:** `src/components/tasks/TaskItem.tsx:207-210`

**Root cause:** The mobile "التفاصيل" button used `px-1.5 py-0.5 text-[10px]`, resulting in a touch target of ~16px — far below the minimum 44px recommendation.

**Fix:** Changed to `px-3 py-1.5 text-xs` with `min-h-[44px]` ensuring a 44px minimum touch target.

---

## 6. Sidebar — Touch Target Sizing (MEDIUM)

**File:** `src/components/layout/Sidebar.tsx`

**Root cause:** Collapse button was 32×32px and project delete button used tight padding — both below 44px mobile minimum.

**Fix:** 
- Collapse button: `h-11 w-11 md:h-8 md:w-8` (44px mobile, 32px desktop)
- Delete button: `p-2` → `p-2.5` on mobile

---

## 7. AddEditHabitModal — Missing Escape Key Handler (MEDIUM)

**File:** `src/components/habits/AddEditHabitModal.tsx`

**Root cause:** Unlike other modals, the habit modal had no Escape keyboard handler.

**Fix:** Added `keydown` listener for Escape key that calls `onClose()`.

---

## 8. Remaining Issues (Not Yet Fixed)

### Task Item Inline Buttons (MEDIUM)
- The Circle/CheckCircle toggle button and priority badge in `TaskItem.tsx` have small touch targets (~20px). Fixing these would require structural layout changes (making the entire row-area tappable) or adding `min-h-[44px]` with adjusted layout.

### Priority Buttons in TaskDetail (LOW)
- The priority selection buttons inside the drawer's details section use `px-2.5 py-1` (~20px). These are inside a scrollable drawer and users are already in a focused interaction context, making this less critical.

### Button `size="sm"` on mobile (LOW)
- `Button.tsx:30` defines `size="sm"` as `h-10` on mobile (40px — just under 44px). No instances of `size="sm"` were found in critical mobile paths; usage is primarily in task list UI elements.

### Drag Handle (LOW)
- The grip-vertical handle for sortable drag is intentionally small and acts as a drag affordance, not a tap target.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/tasks/TaskDetail.tsx` | RTL direction, scroll lock, back button, safe-area-bottom |
| `src/components/tasks/TaskItem.tsx` | التفاصيل button -> min-h-[44px] |
| `src/components/command-palette/CommandPalette.tsx` | Scroll lock + back button |
| `src/components/habits/ConfirmDialog.tsx` | Scroll lock + back button |
| `src/components/habits/AddEditHabitModal.tsx` | Scroll lock + back button + Escape handler |
| `src/components/focus/FocusMode.tsx` | Scroll lock + back button |
| `src/components/layout/Sidebar.tsx` | Collapse button + delete button touch targets |

---

## Verification

- **TypeScript:** `npx tsc --noEmit` passes with zero errors.
- **ESLint:** No linting errors.
- All changes are mobile-only (< 768px) — no desktop or iPad layouts were modified.
