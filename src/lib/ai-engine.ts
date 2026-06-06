import type { Priority } from './types';
import { logger } from './logger';

export interface AITask {
  title: string;
  priority: Priority;
  estimatedMinutes: number;
}

export interface AIDayPlan {
  day: number;
  date: string;
  tasks: AITask[];
}

export interface AIPlan {
  title: string;
  focus: string;
  emoji: string;
  totalDays: number;
  days: AIDayPlan[];
  allTasks: AITask[];
}

interface CategoryTemplate {
  keywords: RegExp[];
  focus: string;
  emoji: string;
  patterns: ((topic: string) => AITask)[];
}

function extractTopic(goal: string): string {
  const clean = goal.replace(/^(أريد|i want to|i need to|i'd like to|انا عايز|أنا)\s*/i, '').trim();
  const stopWords = ['تعلم', 'learn', 'study', 'build', 'create', 'make', 'develop', 'برمجة', 'برنامج', 'تطبيق', 'project', 'مشروع', 'كتابة', 'write', 'عمل', 'do', 'during', 'خلال', 'في', 'within', 'inside'];
  for (const w of stopWords) {
    const idx = clean.toLowerCase().indexOf(w.toLowerCase());
    if (idx === 0) {
      const rest = clean.slice(w.length).replace(/^(ة|ه|ي| )+/i, '').trim();
      if (rest.length > 0) return rest;
    }
  }
  return clean || goal;
}

function clampDays(n: number): number {
  return Math.max(1, Math.min(365, n));
}

function extractDays(goal: string): number {
  const mDay = goal.match(/(\d+)\s*(يوم|day)/i);
  if (mDay) return clampDays(parseInt(mDay[1]));
  const mWeek = goal.match(/(\d+)\s*(أسبوع|week)/i);
  if (mWeek) return clampDays(parseInt(mWeek[1]) * 7);
  const mMonth = goal.match(/(\d+)\s*(شهر|month)/i);
  if (mMonth) return clampDays(parseInt(mMonth[1]) * 30);
  const mYear = goal.match(/(\d+)\s*(سنة|year)/i);
  if (mYear) return clampDays(parseInt(mYear[1]) * 365);
  const mBare = goal.match(/(?:خلال|في|لمدة|within|in)\s*(\d+)/i);
  if (mBare) return clampDays(parseInt(mBare[1]));
  if (/\b(يوم|today|اليوم)\b/i.test(goal)) return 1;
  if (/\b(week|اسبوع|7\s*أيام)\b/i.test(goal)) return 7;
  if (/\b(month|شهر|30\s*يوم)\b/i.test(goal)) return 30;
  return 14;
}

function formatDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

const CATEGORIES: CategoryTemplate[] = [
  {
    keywords: [/learn/i, /study/i, /تعلم/i, /ادرس/i, /course/i, /دورة/i, /شهادة/i, /certificate/i],
    focus: 'تعلم',
    emoji: '📚',
    patterns: [
      (t) => ({ title: `مقدمة عن ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `قراءة أساسيات ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
      (t) => ({ title: `مشاهدة فيديوهات شرح ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `تلخيص المفاهيم الأساسية في ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `تمارين عملية على ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 }),
      (t) => ({ title: `مراجعة ما تعلمته في ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `مشروع تطبيقي: ${t}`, priority: 'high' as Priority, estimatedMinutes: 120 }),
      (t) => ({ title: `اختبار قصير: ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `مراجعة شاملة لـ ${t}`, priority: 'low' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `تقييم التقدم في ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 }),
    ],
  },
  {
    keywords: [/build/i, /create/i, /develop/i, /project/i, /make/i, /مشروع/i, /تطبيق/i, /برمج/i, /construct/i, /app/i, /website/i, /site/i, /برنامج/i],
    focus: 'تطوير',
    emoji: '💻',
    patterns: [
      (t) => ({ title: `تخطيط ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `تصميم واجهة ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
      (t) => ({ title: `إعداد بيئة العمل لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `بناء الهيكل الأساسي لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 }),
      (t) => ({ title: `إضافة الميزات الأساسية لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 120 }),
      (t) => ({ title: `اختبار ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `تحسين أداء ${t}`, priority: 'medium' as Priority, estimatedMinutes: 60 }),
      (t) => ({ title: `إصلاح أخطاء ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
      (t) => ({ title: `توثيق ${t}`, priority: 'low' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `نشر ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
    ],
  },
  {
    keywords: [/write/i, /كتابة/i, /content/i, /blog/i, /article/i, /مقال/i, /book/i, /كتاب/i, /author/i, /تأليف/i],
    focus: 'كتابة',
    emoji: '✍️',
    patterns: [
      (t) => ({ title: `تخطيط هيكل ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `بحث وجمع معلومات عن ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
      (t) => ({ title: `كتابة المسودة الأولى لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 }),
      (t) => ({ title: `مراجعة وتحرير ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `إضافة الصور والرسوم لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `تدقيق لغوي لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `نشر ${t}`, priority: 'medium' as Priority, estimatedMinutes: 15 }),
      (t) => ({ title: `الترويج لـ ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 }),
    ],
  },
  {
    keywords: [/health/i, /fitness/i, /workout/i, /exercise/i, /diet/i, /nutrition/i, /صحة/i, /رياضة/i, /لياقة/i, /رجيم/i, /دايت/i, /weight/i, /وزن/i],
    focus: 'صحة',
    emoji: '💪',
    patterns: [
      (t) => ({ title: `وضع خطة ${t}`, priority: 'high' as Priority, estimatedMinutes: 20 }),
      (t) => ({ title: `تمارين ${t} - المجموعة الأولى`, priority: 'high' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `تمارين ${t} - المجموعة الثانية`, priority: 'high' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `تسجيل قياسات ${t}`, priority: 'medium' as Priority, estimatedMinutes: 10 }),
      (t) => ({ title: `تحضير وجبات صحية لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `قراءة عن ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 }),
      (t) => ({ title: `تمارين استشفاء لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 }),
    ],
  },
  {
    keywords: [/design/i, /ui/i, /ux/i, /تصميم/i, /graphic/i, /جرافيك/i, /photo/i, /صورة/i, /video/i, /فيديو/i, /edit/i, /تحرير/i],
    focus: 'إبداع',
    emoji: '🎨',
    patterns: [
      (t) => ({ title: `بحث وجمع إلهام لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `رسم اسكتشات ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 }),
      (t) => ({ title: `تصميم ${t} - الجزء الأول`, priority: 'high' as Priority, estimatedMinutes: 90 }),
      (t) => ({ title: `تصميم ${t} - الجزء الثاني`, priority: 'high' as Priority, estimatedMinutes: 90 }),
      (t) => ({ title: `مراجعة وتحسين ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
      (t) => ({ title: `الحصول على تغذية راجعة عن ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 }),
      (t) => ({ title: `تسليم ${t}`, priority: 'high' as Priority, estimatedMinutes: 15 }),
    ],
  },
];

const GENERIC_PATTERNS = [
  (t: string) => ({ title: `البحث وجمع معلومات عن ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
  (t: string) => ({ title: `تخطيط ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 }),
  (t: string) => ({ title: `تنفيذ ${t} - المرحلة الأولى`, priority: 'high' as Priority, estimatedMinutes: 90 }),
  (t: string) => ({ title: `تنفيذ ${t} - المرحلة الثانية`, priority: 'medium' as Priority, estimatedMinutes: 90 }),
  (t: string) => ({ title: `مراجعة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 }),
  (t: string) => ({ title: `تحسين ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 }),
  (t: string) => ({ title: `إنهاء ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 }),
  (t: string) => ({ title: `توثيق ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 }),
];

export function generatePlan(goal: string): AIPlan {
  const topic = extractTopic(goal);
  const totalDays = extractDays(goal);
  const focusTitle = goal.length > 50 ? goal.slice(0, 50) + '…' : goal;

  const category = CATEGORIES.find((c) => c.keywords.some((k) => k.test(goal)));
  const patterns = category?.patterns ?? GENERIC_PATTERNS;
  const focus = category?.focus ?? 'عام';
  const emoji = category?.emoji ?? '🎯';

  try {
    const tasksPerDay = Math.max(1, Math.min(3, Math.ceil(patterns.length / Math.max(1, totalDays))));
    const totalTasks = Math.min(patterns.length * Math.ceil(totalDays / Math.max(1, Math.ceil(patterns.length / tasksPerDay))), totalDays * 3, 35);

    const allTasks: AITask[] = [];
    for (let i = 0; i < totalTasks; i++) {
      const pattern = patterns[i % patterns.length];
      allTasks.push(pattern(topic));
    }

    const days: AIDayPlan[] = [];
    let taskIdx = 0;
    for (let d = 0; d < totalDays && taskIdx < allTasks.length; d++) {
      const dayTasks: AITask[] = [];
      for (let t = 0; t < tasksPerDay && taskIdx < allTasks.length; t++) {
        dayTasks.push(allTasks[taskIdx]);
        taskIdx++;
      }
      days.push({ day: d + 1, date: formatDate(d), tasks: dayTasks });
    }

    logger.info('AI plan generated', { goal, totalDays, totalTasks: allTasks.length });
    return { title: focusTitle, focus, emoji, totalDays, days, allTasks };
  } catch (e) {
    logger.error('AI plan generation failed', e);
    const fallback: AITask = { title: `إنجاز ${topic || goal}`, priority: 'medium', estimatedMinutes: 60 };
    return {
      title: focusTitle, focus, emoji, totalDays: 1,
      days: [{ day: 1, date: formatDate(0), tasks: [fallback] }],
      allTasks: [fallback],
    };
  }
}
