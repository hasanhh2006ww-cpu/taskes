import { logger } from './logger';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.warn(`Failed to load ${key}`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Try to free space by removing stale notification-tracking keys
      const stalePrefixes = ['lastStreakWarning-', 'lastWeeklyStreakWarning-', 'lastMonthlyStreakWarning-'];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && stalePrefixes.some(p => k.startsWith(p))) {
          localStorage.removeItem(k);
        }
      }
      // Retry once
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return;
      } catch { /* give up */ }
    }
    logger.error(`Failed to save ${key}`, e);
  }
}
