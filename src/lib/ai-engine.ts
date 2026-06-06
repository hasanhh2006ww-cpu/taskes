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
  phase?: string;
  focus?: string;
}

export interface AIPlan {
  title: string;
  focus: string;
  emoji: string;
  totalDays: number;
  days: AIDayPlan[];
  allTasks: AITask[];
  type: string;
  approach: string;
}

export interface Clarification {
  needsClarification: true;
  question: string;
  context: string;
}

type TaskType = 'technical' | 'creative' | 'administrative' | 'research' | 'problem-solving' | 'learning' | 'personal' | 'business';
type Complexity = 'simple' | 'moderate' | 'complex';

interface ParsedIntent {
  topic: string;
  type: TaskType;
  complexity: Complexity;
  clarity: number;
  constraints: string[];
  totalDays: number;
  needsClarification: boolean;
  clarification?: string;
}

function extractTopic(goal: string): string {
  const clean = goal.replace(/^(أريد|i want to|i need to|i'd like to|انا عايز|أنا|اريد)\s*/i, '').trim();
  const stopWords = ['تعلم', 'learn', 'study', 'build', 'create', 'make', 'develop', 'برمجة', 'برنامج', 'تطبيق', 'project', 'مشروع', 'كتابة', 'write', 'عمل', 'do', 'during', 'خلال', 'في', 'within', 'inside', 'انشاء', 'تصميم', 'تطوير', 'إنجاز'];
  for (const w of stopWords) {
    const idx = clean.toLowerCase().indexOf(w.toLowerCase());
    if (idx === 0) {
      const rest = clean.slice(w.length).replace(/^(ة|ه|ي| |\s|-)+/i, '').trim();
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
  if (/\b(week|اسبوع)\b/i.test(goal)) return 7;
  if (/\b(month|شهر)\b/i.test(goal)) return 30;
  return 14;
}

function formatDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const AMBIGUITY_PATTERNS = [
  { pattern: /^(شيء|حاجة|شئ|thing|something|موضوع)\s/gi, question: 'ما هو المجال أو الموضوع المحدد الذي تريد العمل عليه؟', context: 'general' },
  { pattern: /^(عمل|project|مشروع)\s/gi, question: 'ما هو نوع المشروع الذي تفكر فيه؟ (تقني، إبداعي، بحثي…)', context: 'project' },
  { pattern: /^(طور|حسن|طور|improve|enhance|حسن)\s/gi, question: 'ما الشيء المحدد الذي تريد تطويره أو تحسينه؟', context: 'improve' },
  { pattern: /^(فكرة|idea|اقتراح)\s/gi, question: 'هل يمكنك توضيح الفكرة أكثر؟ ما هو الهدف النهائي؟', context: 'idea' },
];

const typeClassifiers: { regex: RegExp; type: TaskType }[] = [
  { regex: /(برمج|تطبيق|website|app|api|backend|frontend|fullstack|database|server|code|برنامج|كود|برمجة)/i, type: 'technical' },
  { regex: /(تعلم|study|learn|course|دورة|شهادة|certificate|ادرس|أدرس|قراءة|read)/i, type: 'learning' },
  { regex: /(ارسم|design|تصميم|ui|ux|graphic|جرافيك|فيديو|video|edit|مونتاج|تصوير|photo)/i, type: 'creative' },
  { regex: /(بحث|research|analyze|تحليل|دراسة|report|تقرير|study|investigate)/i, type: 'research' },
  { regex: /(problem|bug|مشكلة|خطأ|error|fix|إصلاح|حل|solve|troubleshoot)/i, type: 'problem-solving' },
  { regex: /(health|fitness|workout|رياضة|صحة|diet|رجيم|weight|weightloss)/i, type: 'personal' },
  { regex: /(business|شركة|مشروع تجاري|startup|ربح|profit|سوق|market|customers|عملاء)/i, type: 'business' },
  { regex: /(plan|خطط|نظم|organize|إدارة|manage|schedule|جدول|task|مهمة|تنظیم)/i, type: 'administrative' },
];

function classifyType(goal: string): TaskType {
  for (const c of typeClassifiers) {
    if (c.regex.test(goal)) return c.type;
  }
  return 'personal';
}

function estimateComplexity(goal: string): Complexity {
  const lengthScore = Math.min(goal.length / 100, 1);
  const detailWords = ['محدد', 'specific', 'detailed', 'detailed', 'خطة', 'strategy', 'استراتيجية', 'integrate', 'integration', 'multi', 'multiple', 'complex'];
  const detailScore = detailWords.some(w => goal.toLowerCase().includes(w)) ? 0.3 : 0;
  const techTerms = goal.match(/(api|database|server|architecture|algorithm|framework|library|منصة|نظام|بنية)/gi);
  const techScore = techTerms ? Math.min(techTerms.length * 0.15, 0.4) : 0;
  const total = lengthScore + detailScore + techScore;
  if (total > 0.6) return 'complex';
  if (total > 0.3) return 'moderate';
  return 'simple';
}

function measureClarity(goal: string): number {
  const words = goal.trim().split(/\s+/).length;
  const hasVerb = /(أريد|اريد|اعمل|أعمل|أتعلم|اتعلم|build|create|learn|develop|make|do)/i.test(goal);
  const hasObject = goal.length > 15;
  const hasTime = /\d+\s*(يوم|day|week|أسبوع|month|شهر)/i.test(goal);
  let score = 0;
  if (words >= 3) score += 0.2;
  if (words >= 6) score += 0.15;
  if (hasVerb) score += 0.2;
  if (hasObject) score += 0.2;
  if (hasTime) score += 0.25;
  return Math.min(score, 1);
}

function detectAmbiguity(goal: string): { isAmbiguous: boolean; question?: string; context?: string } {
  for (const a of AMBIGUITY_PATTERNS) {
    if (a.pattern.test(goal)) {
      const words = goal.replace(a.pattern, '').trim().split(/\s+/).length;
      if (words < 3) return { isAmbiguous: true, question: a.question, context: a.context };
    }
  }
  if (goal.trim().split(/\s+/).length < 3) {
    return { isAmbiguous: true, question: 'هل يمكنك وصف هدفك بمزيد من التفاصيل؟', context: 'too-short' };
  }
  return { isAmbiguous: false };
}

// --- Strategy Generators ---

interface Strategy {
  name: string;
  phases: string[];
  generateTasks: (topic: string, totalDays: number, rng: () => number) => AITask[];
}

function generateTechnicalTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تحليل متطلبات ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تصميم بنية ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `إعداد بيئة ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `بناء النواة الأساسية لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `ربط ${t} بقواعد البيانات`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `بناء واجهة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `اختبار ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تحسين أداء ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `توثيق ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 25) }),
    (t: string) => ({ title: `نشر ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `إضافة صلاحيات المستخدمين لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تأمين ${t}`, priority: 'high' as Priority, estimatedMinutes: 40 + Math.floor(rng() * 20) }),
  ];
  return shuffleArray(templates, rng).slice(0, 6 + Math.floor(rng() * 6)).map(fn => fn(topic));
}

function generateLearningTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `البحث عن مصادر تعلم ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `قراءة المفاهيم الأساسية لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `مشاهدة فيديوهات شرح ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تلخيص درس ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `حل تمارين ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 45) }),
    (t: string) => ({ title: `تطبيق عملي على ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `مراجعة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `اختبار قصير في ${t}`, priority: 'medium' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
    (t: string) => ({ title: `مشروع تدريبي: ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `مناقشة ${t} مع زملاء`, priority: 'low' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
  ];
  return shuffleArray(templates, rng).slice(0, 5 + Math.floor(rng() * 6)).map(fn => fn(topic));
}

function generateCreativeTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `جمع إلهام وأفكار لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `رسم اسكتشات ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تطوير المفهوم البصري لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تنفيذ ${t} - المرحلة الأولى`, priority: 'high' as Priority, estimatedMinutes: 90 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تنفيذ ${t} - التفاصيل الدقيقة`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `تجربة ألوان وخطوط ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 25) }),
    (t: string) => ({ title: `مراجعة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `الحصول على تغذية راجعة لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
    (t: string) => ({ title: `تحسين ${t} بناءً على الملاحظات`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تسليم ${t}`, priority: 'high' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
  ];
  return shuffleArray(templates, rng).slice(0, 5 + Math.floor(rng() * 6)).map(fn => fn(topic));
}

function generateResearchTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تحديد نطاق البحث: ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `مراجعة الأدبيات السابقة عن ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `صياغة أسئلة البحث لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `جمع بيانات ${t}`, priority: 'high' as Priority, estimatedMinutes: 90 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `تحليل بيانات ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `كتابة نتائج ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `مناقشة نتائج ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `صياغة توصيات ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `إعداد تقرير ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `مراجعة وتدقيق ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
  ];
  return shuffleArray(templates, rng).slice(0, 6 + Math.floor(rng() * 5)).map(fn => fn(topic));
}

function generateProblemSolvingTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تحليل المشكلة: ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `جمع معلومات عن ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تحديد أسباب ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `اقتراح حلول لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تقييم الحلول المقترحة لـ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تنفيذ الحل الأمثل لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `اختبار الحل لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `توثيق الحل: ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `متابعة نتائج حل ${t}`, priority: 'medium' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
  ];
  return shuffleArray(templates, rng).slice(0, 5 + Math.floor(rng() * 5)).map(fn => fn(topic));
}

function generatePersonalTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تحديد أهداف ${t}`, priority: 'high' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
    (t: string) => ({ title: `وضع جدول ${t}`, priority: 'high' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `ممارسة ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تسجيل تقدم ${t}`, priority: 'medium' as Priority, estimatedMinutes: 10 + Math.floor(rng() * 10) }),
    (t: string) => ({ title: `قراءة عن ${t}`, priority: 'low' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
    (t: string) => ({ title: `مراجعة أداء ${t}`, priority: 'medium' as Priority, estimatedMinutes: 10 + Math.floor(rng() * 10) }),
    (t: string) => ({ title: `تعديل خطة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 10 + Math.floor(rng() * 10) }),
    (t: string) => ({ title: `مكافأة النفس بعد ${t}`, priority: 'low' as Priority, estimatedMinutes: 5 + Math.floor(rng() * 10) }),
  ];
  return shuffleArray(templates, rng).slice(0, 4 + Math.floor(rng() * 5)).map(fn => fn(topic));
}

function generateGenericTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تخطيط ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `البحث عن ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `بدء ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `متابعة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `مراجعة ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تحسين ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `إنهاء ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `توثيق ${t}`, priority: 'low' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
  ];
  return shuffleArray(templates, rng).slice(0, 4 + Math.floor(rng() * 5)).map(fn => fn(topic));
}

function generateBusinessTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `دراسة جدوى ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تحليل السوق لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `تحديد الجمهور المستهدف لـ ${t}`, priority: 'high' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `وضع خطة تسويق ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `إعداد ميزانية ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `بناء فريق ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `إطلاق ${t}`, priority: 'high' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 60) }),
    (t: string) => ({ title: `قياس أداء ${t}`, priority: 'medium' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تطوير ${t}`, priority: 'medium' as Priority, estimatedMinutes: 45 + Math.floor(rng() * 30) }),
    (t: string) => ({ title: `توسيع نطاق ${t}`, priority: 'low' as Priority, estimatedMinutes: 60 + Math.floor(rng() * 30) }),
  ];
  return shuffleArray(templates, rng).slice(0, 6 + Math.floor(rng() * 5)).map(fn => fn(topic));
}

function generateAdministrativeTasks(topic: string, totalDays: number, rng: () => number): AITask[] {
  const templates = [
    (t: string) => ({ title: `تحديد أولويات ${t}`, priority: 'high' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تنظيم جدول ${t}`, priority: 'high' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تقسيم ${t} إلى مهام صغيرة`, priority: 'high' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تعيين مسؤوليات ${t}`, priority: 'medium' as Priority, estimatedMinutes: 15 + Math.floor(rng() * 15) }),
    (t: string) => ({ title: `متابعة تنفيذ ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `تقييم نتائج ${t}`, priority: 'medium' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `إعداد تقرير ${t}`, priority: 'low' as Priority, estimatedMinutes: 30 + Math.floor(rng() * 20) }),
    (t: string) => ({ title: `توثيق إجراءات ${t}`, priority: 'low' as Priority, estimatedMinutes: 20 + Math.floor(rng() * 20) }),
  ];
  return shuffleArray(templates, rng).slice(0, 5 + Math.floor(rng() * 4)).map(fn => fn(topic));
}

const taskGenerators: Record<TaskType, (topic: string, totalDays: number, rng: () => number) => AITask[]> = {
  technical: generateTechnicalTasks,
  learning: generateLearningTasks,
  creative: generateCreativeTasks,
  research: generateResearchTasks,
  'problem-solving': generateProblemSolvingTasks,
  personal: generatePersonalTasks,
  business: generateBusinessTasks,
  administrative: generateAdministrativeTasks,
};

const typeMeta: Record<TaskType, { emoji: string; focus: string }> = {
  technical: { emoji: '💻', focus: 'تقني' },
  learning: { emoji: '📚', focus: 'تعلم' },
  creative: { emoji: '🎨', focus: 'إبداع' },
  research: { emoji: '🔬', focus: 'بحث' },
  'problem-solving': { emoji: '🧩', focus: 'حل مشكلات' },
  personal: { emoji: '🌟', focus: 'تطوير شخصي' },
  business: { emoji: '📈', focus: 'أعمال' },
  administrative: { emoji: '📋', focus: 'تنظيم' },
};

const phaseSets: Record<string, string[][]> = {
  technical: [
    ['تحليل', 'تصميم', 'بناء', 'اختبار', 'نشر'],
    ['تخطيط', 'تطوير', 'دمج', 'تحسين'],
    ['أساسيات', 'ميزات', 'تجربة', 'إطلاق'],
  ],
  learning: [
    ['أساسيات', 'تعمق', 'تطبيق', 'مراجعة'],
    ['استكشاف', 'فهم', 'تمارين', 'مشروع'],
    ['مقدمة', 'ممارسة', 'إتقان'],
  ],
  creative: [
    ['إلهام', 'تصميم', 'تنفيذ', 'تسليم'],
    ['فكرة', 'تطوير', 'تحسين', 'إنهاء'],
    ['بحث', 'اسكتش', 'إنتاج', 'مراجعة'],
  ],
  research: [
    ['تحديد', 'جمع', 'تحليل', 'كتابة'],
    ['استكشاف', 'بيانات', 'نتائج', 'توصيات'],
    ['فرضية', 'بحث', 'استنتاج', 'توثيق'],
  ],
  'problem-solving': [
    ['تحليل', 'حلول', 'تنفيذ', 'مراجعة'],
    ['تشخيص', 'خطة', 'تطبيق', 'متابعة'],
    ['فهم', 'تخطيط', 'حل', 'اختبار'],
  ],
  personal: [
    ['تخطيط', 'تنفيذ', 'تقييم'],
    ['بداية', 'استمرار', 'تطوير'],
    ['هدف', 'ممارسة', 'نتيجة'],
  ],
  business: [
    ['دراسة', 'تخطيط', 'إطلاق', 'تقييم'],
    ['بحث', 'استراتيجية', 'تنفيذ', 'توسع'],
    ['تحليل', 'بناء', 'تسويق', 'نمو'],
  ],
  administrative: [
    ['تنظيم', 'توزيع', 'متابعة', 'توثيق'],
    ['تخطيط', 'تنفيذ', 'مراجعة', 'تقييم'],
    ['أولويات', 'مهام', 'متابعة', 'إنجاز'],
  ],
};

function pickStrategy(taskType: TaskType, rng: () => number): { phases: string[]; approach: string } {
  const options = phaseSets[taskType] || phaseSets['personal'];
  const phases = options[Math.floor(rng() * options.length)];
  const approachDescriptions: Record<string, string[]> = {
    technical: ['منهجية تطوير تدريجية', 'بناء من الألف إلى الياء', 'تطوير موجه بالميزات'],
    learning: ['رحلة تعلم تصاعدية', 'نهج الفهم والتطبيق', 'أسلوب التدريب العملي'],
    creative: ['رحلة إبداعية متكاملة', 'تطوير مفهوم إلى منتج', 'من الفكرة إلى التنفيذ'],
    research: ['منهجية بحثية منظمة', 'استقصاء وتحليل عميق', 'بحث قائم على الفرضيات'],
    'problem-solving': ['حل منهجي للمشكلات', 'تشخيص وحل ذكي', 'معالجة تدريجية'],
    personal: ['خطة تحسين ذاتي', 'برنامج تطور شخصي', 'منهجية نماء مستمر'],
    business: ['استراتيجية أعمال متكاملة', 'من الفكرة إلى السوق', 'نمو وتوسع منظم'],
    administrative: ['إدارة منظمة بالمهام', 'تخطيط وتنفيذ منضبط', 'نظام إنجاز فعال'],
  };
  const descs = approachDescriptions[taskType] || approachDescriptions['personal'];
  const approach = descs[Math.floor(rng() * descs.length)];
  return { phases, approach };
}

function distributeAcrossDays(tasks: AITask[], totalDays: number, phases: string[], rng: () => number): AIDayPlan[] {
  if (totalDays === 0) return [];
  const shuffled = shuffleArray(tasks, rng);
  const daysA: AIDayPlan[] = [];

  if (totalDays <= 3) {
    const perDay = Math.ceil(shuffled.length / totalDays);
    for (let d = 0; d < totalDays; d++) {
      const dayTasks = shuffled.slice(d * perDay, (d + 1) * perDay);
      const phaseIdx = Math.min(d, phases.length - 1);
      daysA.push({
        day: d + 1,
        date: formatDate(d),
        tasks: dayTasks,
        phase: phases[phaseIdx] || undefined,
        focus: undefined,
      });
    }
  } else {
    const tasksPerPhase = Math.ceil(shuffled.length / phases.length);
    for (let p = 0; p < phases.length; p++) {
      const phaseTasks = shuffled.slice(p * tasksPerPhase, (p + 1) * tasksPerPhase);
      const daysInPhase = Math.max(1, Math.floor(totalDays / phases.length) + (p < totalDays % phases.length ? 1 : 0));
      const tasksPerDay = Math.ceil(phaseTasks.length / daysInPhase);
      for (let d = 0; d < daysInPhase; d++) {
        const dayTasks = phaseTasks.slice(d * tasksPerDay, (d + 1) * tasksPerDay);
        if (dayTasks.length === 0) continue;
        daysA.push({
          day: daysA.length + 1,
          date: formatDate(daysA.length),
          tasks: dayTasks,
          phase: phases[p],
          focus: undefined,
        });
      }
    }
  }

  return daysA.map(d => ({
    ...d,
    focus: d.tasks.length > 1
      ? pickRandom(['تركيز', 'أساسي', 'مهم', 'ضروري'], rng)
      : undefined,
  }));
}

export function analyzeIntent(goal: string): { parsed?: ParsedIntent; clarification?: Clarification } {
  const trimmed = goal.trim();
  if (!trimmed) {
    return { clarification: { needsClarification: true, question: 'ما هو هدفك؟ اكتب ما تريد تحقيقه.', context: 'empty' } };
  }

  const ambiguity = detectAmbiguity(trimmed);
  if (ambiguity.isAmbiguous) {
    const parsed: ParsedIntent = {
      topic: extractTopic(trimmed),
      type: classifyType(trimmed),
      complexity: estimateComplexity(trimmed),
      clarity: measureClarity(trimmed),
      constraints: [],
      totalDays: extractDays(trimmed),
      needsClarification: true,
      clarification: ambiguity.question,
    };
    return {
      parsed,
      clarification: { needsClarification: true, question: ambiguity.question!, context: ambiguity.context! },
    };
  }

  const parsed: ParsedIntent = {
    topic: extractTopic(trimmed),
    type: classifyType(trimmed),
    complexity: estimateComplexity(trimmed),
    clarity: measureClarity(trimmed),
    constraints: [],
    totalDays: extractDays(trimmed),
    needsClarification: false,
  };

  return { parsed };
}

export function generatePlan(goal: string): AIPlan {
  const trimmed = goal.trim();
  const topic = extractTopic(trimmed);
  const totalDays = extractDays(trimmed);
  const type = classifyType(trimmed);
  const complexity = estimateComplexity(trimmed);
  const clarity = measureClarity(trimmed);
  const rng = seedRandom(hashStr(trimmed));
  const { emoji, focus } = typeMeta[type];
  const focusTitle = trimmed.length > 50 ? trimmed.slice(0, 50) + '…' : trimmed;

  try {
    const generator = taskGenerators[type] || generateGenericTasks;
    let tasks = generator(topic, totalDays, rng);
    if (tasks.length < 2) {
      tasks = generateGenericTasks(topic, totalDays, rng);
    }

    const { phases, approach } = pickStrategy(type, rng);
    const days = distributeAcrossDays(tasks, totalDays, phases, rng);

    const allTasks = days.flatMap(d => d.tasks);

    logger.info('Adaptive plan generated', { goal, type, complexity, totalDays, totalTasks: allTasks.length, phases: phases.join(' → ') });
    return { title: focusTitle, focus, emoji, totalDays, days, allTasks, type, approach };
  } catch (e) {
    logger.error('Adaptive plan generation failed', e);
    const fallback: AITask = { title: `إنجاز ${topic || trimmed}`, priority: 'medium', estimatedMinutes: 60 };
    return {
      title: focusTitle, focus, emoji, totalDays: 1,
      days: [{ day: 1, date: formatDate(0), tasks: [fallback] }],
      allTasks: [fallback],
      type, approach: 'خطة بسيطة',
    };
  }
}
