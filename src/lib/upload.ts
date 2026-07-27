import fs from 'fs';
import path from 'path';

const AVATAR_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'avatars');
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateAvatar(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. استخدم PNG أو JPG أو WEBP');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
  }
}

export async function saveAvatar(userId: string, file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.png';
  const safeName = `${userId}${ext}`;

  if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(AVATAR_DIR, safeName), bytes);
  return `/uploads/avatars/${safeName}`;
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
