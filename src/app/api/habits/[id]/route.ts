import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
    include: { logs: true },
  });
  if (!habit) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  return NextResponse.json(habit);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  try {
    const body = await request.json();
    const habit = await prisma.habit.update({ where: { id }, data: body });
    return NextResponse.json(habit);
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  await prisma.habitLog.deleteMany({ where: { habitId: id } });
  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ message: 'تم الحذف' });
}
