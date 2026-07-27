import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findFirst({ where: { id, userId: session.user.id } });
  if (!task) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  return NextResponse.json(task);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.task.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const task = await prisma.task.update({ where: { id }, data: parsed.data });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.task.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ message: 'تم الحذف' });
}
