import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const sessions = await prisma.focusSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: 'desc' },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const body = await request.json();
    const focusSession = await prisma.focusSession.create({
      data: { ...body, userId: session.user.id },
    });
    return NextResponse.json(focusSession, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
