export type EndSoundId = 'chime' | 'bell' | 'beep' | 'celebration' | 'custom';

export const END_SOUNDS: { id: EndSoundId; label: string }[] = [
  { id: 'chime', label: 'نغمة بسيطة' },
  { id: 'bell', label: 'جرس' },
  { id: 'beep', label: 'تنبيه رقمي' },
  { id: 'celebration', label: 'احتفال' },
  { id: 'custom', label: 'رابط مخصص' },
];

export interface FocusSuggestion {
  duration: number;
  focusType: string;
  label: string;
}

export function suggestFocus(title: string): FocusSuggestion {
  const lower = title.toLowerCase();
  if (
    /\b(code|program|project|build|develop|feature|bug|api|backend|frontend|implement|refactor|architecture|function|component|database|server|client)\b/.test(lower)
  ) {
    return { duration: 90, focusType: 'deep', label: 'Deep Work' };
  }
  if (
    /\b(study|read|learn|research|review|document|analyze|understand|study|practice|exam|quiz|تمرين|دراسة|قراءة|بحث)\b/.test(lower)
  ) {
    return { duration: 50, focusType: 'light', label: 'مراجعة' };
  }
  if (
    /\b(design|write|creative|sketch|draw|compose|brainstorm|plan|ui|ux|mockup|wireframe|تصميم|كتابة|رسم)\b/.test(lower)
  ) {
    return { duration: 50, focusType: 'creative', label: 'إبداعي' };
  }
  return { duration: 25, focusType: 'light', label: 'خفيف' };
}

export function playBell(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

export function playBeep(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1000;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function playEndSound(ctx: AudioContext, soundId: EndSoundId, customUrl?: string) {
  switch (soundId) {
    case 'bell':
      playBell(ctx);
      break;
    case 'beep':
      playBeep(ctx);
      break;
    case 'custom':
      if (customUrl) {
        try { new Audio(customUrl).play(); } catch { /* silent */ }
      }
      break;
    default:
      break;
  }
}
