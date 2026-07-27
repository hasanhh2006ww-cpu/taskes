'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store/useUIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useSession } from 'next-auth/react';
import { getInitials } from '@/lib/utils';
import { Search, Bell, Zap, Sun, Moon, Monitor, ChevronDown, LayoutDashboard, Plus, Target, Flame, Calendar, BarChart3, Settings, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  shadow: string;
  action?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: Plus, label: 'مهمة جديدة', href: '/tasks', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard', color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
  { icon: Target, label: 'جلسة تركيز', href: '#focus', color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20', action: 'focus' },
  { icon: Calendar, label: 'التقويم', href: '/calendar', color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-500/20' },
  { icon: Flame, label: 'العادات', href: '/habits', color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/20' },
  { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard#stats', color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20', action: 'scroll-stats' },
];

export function Topbar() {
  const { darkMode, themeMode, toggleDarkMode, toggleFocusMode } = useUIStore();
  const { tasks } = useTaskStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const user = status === 'authenticated' ? session?.user : null;
  const unreadNotifications = tasks.filter(t => t.dueDate && t.dueDate < new Date().toISOString().split('T')[0] && !t.completed).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleQuickAction = (action: QuickAction) => {
    if (action.action === 'focus') {
      toggleFocusMode();
    } else if (action.action === 'scroll-stats') {
      document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(action.href);
    }
    setQuickActionsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = (e.currentTarget as HTMLFormElement).elements.namedItem('search') as HTMLInputElement;
    if (query.value.trim()) {
      router.push(`/tasks?search=${encodeURIComponent(query.value.trim())}`);
      setSearchOpen(false);
      query.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800/40 dark:bg-zinc-950/60">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => useUIStore.getState().setSidebarOpen(!useUIStore.getState().sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80 md:hidden"
          aria-label="فتح القائمة"
        >
          <LayoutDashboard className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className={cn('relative flex-1 max-w-xl', searchOpen && 'md:max-w-2xl')}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              ref={searchRef}
              name="search"
              type="search"
              placeholder="ابحث عن مهام، مشاريع، عادات..."
              className={cn(
                'w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pe-4 ps-9 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200',
                'focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10',
                'dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500',
                'dark:focus:border-emerald-600 dark:focus:bg-zinc-900 dark:focus:ring-emerald-500/10',
                searchOpen && 'ring-2 ring-emerald-500/20 shadow-lg'
              )}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              autoComplete="off"
              aria-label="البحث الشامل"
            />
            {searchOpen && (
              <kbd className="absolute end-3 top-1/2 -translate-y-1/2 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                ⎋ إلغاء
              </kbd>
            )}
          </form>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden md:flex md:items-center md:gap-2" role="group" aria-label="إجراءات سريعة">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              className={cn(
                'relative flex h-10 items-center gap-2 rounded-xl px-3 transition-all duration-200',
                'bg-gradient-to-r text-white font-medium text-sm shadow-sm',
                action.color,
                action.shadow,
                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
              )}
              aria-label={action.label}
            >
              <action.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Quick Actions Trigger */}
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80 md:hidden"
          aria-label="إجراءات سريعة"
          aria-expanded={quickActionsOpen}
        >
          <Zap className="h-5 w-5" />
        </button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
              aria-label="الإشعارات"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 mt-2 w-[340px] md:w-[380px] rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900/95"
                role="menu"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">الإشعارات</h3>
                  <button
                    onClick={() => { setNotificationsOpen(false); toast.success('تم تمييز الكل كمقروء'); }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    تمييز الكل كمقروء
                  </button>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {unreadNotifications === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">لا توجد إشعارات جديدة</p>
                    </div>
                  ) : (
                    tasks
                      .filter(t => t.dueDate && t.dueDate < new Date().toISOString().split('T')[0] && !t.completed)
                      .slice(0, 5)
                      .map((task) => (
                        <button
                          key={task.id}
                          onClick={() => { router.push('/tasks'); setNotificationsOpen(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-start hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                          role="menuitem"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-900/30">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{task.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">مهمة متأخرة — تحتاج مراجعة</p>
                          </div>
                        </button>
                      ))
                  )}
                </div>
                <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <button
                    onClick={() => { router.push('/tasks'); setNotificationsOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    عرض جميع الإشعارات
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
            aria-label={themeMode === 'dark' ? 'الوضع الفاتح' : themeMode === 'auto' ? 'الوضع التلقائي' : 'الوضع الليلي'}
            title={themeMode === 'light' ? 'فاتح' : themeMode === 'dark' ? 'داكن' : 'تلقائي'}
          >
            {themeMode === 'dark' ? <Moon className="h-5 w-5" /> : themeMode === 'auto' ? <Monitor className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); }}
              className="flex items-center gap-2 rounded-xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
              aria-label="حساب المستخدم"
              aria-expanded={userMenuOpen}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? 'avatar'}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-sm dark:bg-emerald-500/20 dark:text-emerald-400">
                  {user?.name ? getInitials(user.name) : '?'}
                </div>
              )}
            </button>

            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 mt-2 w-[300px] md:w-[340px] rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900/95"
                role="menu"
              >
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold dark:bg-emerald-500/20 dark:text-emerald-400">
                      {user?.name ? getInitials(user.name) : '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {user?.name ?? 'مستخدم'}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {user?.email ?? ''}
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="py-1">
                  {[
                    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard' as const },
                    { icon: Target, label: 'وضع التركيز', action: 'focus' as const },
                    { icon: Calendar, label: 'التقويم', href: '/calendar' as const },
                    { icon: Flame, label: 'العادات', href: '/habits' as const },
                    { icon: Settings, label: 'الإعدادات', href: '/settings' as const },
                    {
                      icon: LogOut,
                      label: 'تسجيل الخروج',
                      action: 'logout' as const,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.action === 'focus') toggleFocusMode();
                        else if (item.action === 'logout') {
                          signOut({ callbackUrl: '/login' });
                        } else router.push(item.href as string);
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                      role="menuitem"
                    >
                      <item.icon className="h-4 w-4 text-zinc-400" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions Dropdown */}
      {quickActionsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/95"
        >
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-xl px-3 transition-all duration-200',
                  'bg-gradient-to-r text-white font-medium text-sm shadow-sm',
                  action.color,
                  action.shadow,
                  'hover:shadow-md'
                )}
              >
                <action.icon className="h-4 w-4 shrink-0" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}