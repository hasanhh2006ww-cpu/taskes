'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/components/profile/Avatar';
import { updateProfileName, updateProfileEmail, uploadAvatarAction, removeAvatarAction, changePasswordAction, deleteAccountAction, debugUserSession } from '@/lib/actions/profile';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function FormCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/80 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const isDemo = session?.user?.isDemo === true;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state with session changes
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session]);

  async function handleNameChange() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await updateProfileName(name.trim());
    if (res.error) {
      toast.error(res.error);
    } else {
      await update({ user: { name: res.name } });
      toast.success('تم تحديث الاسم');
    }
    setSaving(false);
  }

  async function handleEmailChange() {
    if (isDemo) {
      toast.error('هذه الميزة غير متاحة في الحساب التجريبي');
      return;
    }
    if (!email.trim()) return;
    setSaving(true);
    const res = await updateProfileEmail(email.trim());
    if (res.error) {
      toast.error(res.error);
    } else {
      await update({ user: { email: res.email } });
      toast.success('تم تحديث البريد الإلكتروني');
    }
    setSaving(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await uploadAvatarAction(fd);
    if (res.error) {
      toast.error(res.error);
    } else {
      await update({ user: { image: res.avatar } });
      toast.success('تم تحديث الصورة الشخصية');
    }
    setSaving(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleRemoveAvatar() {
    setSaving(true);
    try {
      await removeAvatarAction();
      await update({ user: { image: null } });
      toast.success('تم حذف الصورة الشخصية');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطأ غير متوقع');
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      toast.error('هذه الميزة غير متاحة في الحساب التجريبي');
      return;
    }
    if (newPw.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('كلمتا المرور غير متطابقتان');
      return;
    }
    setSaving(true);
    const res = await changePasswordAction(currentPw, newPw, confirmPw);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('تم تغيير كلمة المرور');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
    setSaving(false);
  }

  async function handleDeleteAccount() {
    if (isDemo) {
      toast.error('هذه الميزة غير متاحة في الحساب التجريبي');
      return;
    }
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setSaving(true);
    const res = await deleteAccountAction(deletePassword);
    if (res.error) {
      toast.error(res.error);
      setShowDeleteConfirm(false);
    } else {
      window.location.href = '/login';
    }
    setSaving(false);
  }

  const pwStrength = newPw.length > 0
    ? (newPw.length >= 8 ? 'good' : newPw.length >= 5 ? 'weak' : 'none')
    : 'none';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex h-full flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-[#0A0E17]"
    >
      <div className="px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">
          إعدادات الحساب
        </h1>
      </div>

      <div className="flex-1 space-y-4 px-4 pb-8 md:px-6">
        {/* Avatar */}
        <FormCard title="الصورة الشخصية">
          <div className="flex items-center gap-4">
            <Avatar size="lg" />
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400">
                رفع صورة
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              {session?.user?.image && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={saving}
                  className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  حذف الصورة
                </button>
              )}
              <p className="text-xs text-zinc-400">PNG, JPG أو WEBP — حد أقصى 2 ميجابايت</p>
            </div>
          </div>
        </FormCard>

        {/* Personal Info */}
        <FormCard title="المعلومات الشخصية">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">الاسم</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
                  dir="auto"
                />
                <button
                  onClick={handleNameChange}
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                >
                  حفظ
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                البريد الإلكتروني
                {isDemo && <span className="mr-2 text-xs text-amber-500">(غير متاح في النسخة التجريبية)</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDemo}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="auto"
                />
                <button
                  onClick={handleEmailChange}
                  disabled={saving || isDemo}
                  className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </FormCard>

        {/* Password */}
        <FormCard title="تغيير كلمة المرور">
          {isDemo ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              تغيير كلمة المرور غير متاح في الحساب التجريبي.
            </p>
          ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">كلمة المرور الحالية</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              />
              {pwStrength === 'weak' && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">كلمة المرور ضعيفة — استخدم 8 أحرف على الأقل</p>
              )}
              {pwStrength === 'good' && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">قوة كلمة المرور: جيدة</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              تغيير كلمة المرور
            </button>
          </form>
          )}
        </FormCard>

        {/* Delete Account */}
        <FormCard title="حذف الحساب">
          {isDemo ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              حذف الحساب غير متاح في الحساب التجريبي.
            </p>
          ) : !showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
            >
              حذف الحساب
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="أدخل كلمة المرور للتأكيد"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  disabled={saving}
                  className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  حذف نهائي
                </button>
              </div>
            </div>
          )}
        </FormCard>
      </div>
    </motion.div>
  );
}