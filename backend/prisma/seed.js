// ─── Database Seed Script ──────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.taskLabelAssignment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.subTask.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.pomodoroSession.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Demo User ─────────────────────────────────
  const hashedPassword = await bcrypt.hash('Demo1234', 12);

  const user = await prisma.user.create({
    data: {
      name: 'مستخدم تجريبي',
      email: 'demo@my-taske.com',
      password: hashedPassword,
      emailVerified: true,
    },
  });

  console.log(`  ✓ Demo user created: ${user.email}`);

  // Create default settings
  await prisma.userSettings.create({
    data: { userId: user.id },
  });

  // ─── Create Projects ──────────────────────────────────
  const projects = await Promise.all([
    prisma.project.create({
      data: { name: 'تطبيق الويب', color: '#6366f1', icon: 'Globe', userId: user.id },
    }),
    prisma.project.create({
      data: { name: 'التعلم', color: '#22c55e', icon: 'BookOpen', userId: user.id },
    }),
    prisma.project.create({
      data: { name: 'الصحة', color: '#f43f5e', icon: 'Heart', userId: user.id },
    }),
  ]);
  console.log(`  ✓ ${projects.length} projects created`);

  // ─── Create Tasks ─────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'إنهاء تقرير المشروع',
        description: 'كتابة التقرير النهائي لمشروع تطبيق الويب',
        priority: 'HIGH',
        category: 'TASK',
        dueDate: tomorrow,
        important: true,
        userId: user.id,
        projectId: projects[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'قراءة فصل من كتاب',
        description: 'قراءة فصل 5 من كتاب العادات الذرية',
        priority: 'LOW',
        category: 'TASK',
        dueDate: today,
        userId: user.id,
        projectId: projects[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'تمارين رياضية',
        description: '30 دقيقة من تمارين الكارديو',
        priority: 'MEDIUM',
        category: 'TASK',
        dueDate: today,
        userId: user.id,
        projectId: projects[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'مراجعة الكود',
        description: 'مراجعة طلبات السحب على GitHub',
        priority: 'MEDIUM',
        category: 'TASK',
        dueDate: nextWeek,
        userId: user.id,
        projectId: projects[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'اجتماع الفريق',
        description: 'مراجعة أسبوعية مع فريق التطوير',
        priority: 'HIGH',
        category: 'MEETING',
        dueDate: tomorrow,
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'مهمة متأخرة',
        description: 'كان يجب إنجازها أمس',
        priority: 'HIGH',
        category: 'TASK',
        dueDate: yesterday,
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'مهمة مكتملة ✅',
        description: 'تم إنجاز هذه المهمة بنجاح',
        priority: 'LOW',
        category: 'TASK',
        dueDate: yesterday,
        completed: true,
        completedAt: yesterday,
        userId: user.id,
      },
    }),
  ]);
  console.log(`  ✓ ${tasks.length} tasks created`);

  // ─── Create Subtasks ──────────────────────────────────
  await Promise.all([
    prisma.subTask.create({
      data: { title: 'كتابة المقدمة', taskId: tasks[0].id, completed: true, order: 0 },
    }),
    prisma.subTask.create({
      data: { title: 'تحليل النتائج', taskId: tasks[0].id, completed: false, order: 1 },
    }),
    prisma.subTask.create({
      data: { title: 'كتابة التوصيات', taskId: tasks[0].id, completed: false, order: 2 },
    }),
  ]);

  // ─── Create Habits ────────────────────────────────────
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        title: 'قراءة يومية',
        description: 'قراءة 20 دقيقة يومياً',
        type: 'DAILY',
        icon: 'BookOpen',
        color: '#3b82f6',
        userId: user.id,
        streak: 5,
        bestStreak: 12,
      },
    }),
    prisma.habit.create({
      data: {
        title: 'تمارين صباحية',
        description: 'تمارين خفيفة لمدة 15 دقيقة',
        type: 'DAILY',
        icon: 'Heart',
        color: '#f43f5e',
        userId: user.id,
        streak: 3,
        bestStreak: 21,
      },
    }),
    prisma.habit.create({
      data: {
        title: 'تعلم لغة',
        description: 'دراسة لغة جديدة 3 مرات في الأسبوع',
        type: 'WEEKLY',
        icon: 'Globe',
        color: '#22c55e',
        frequency: 3,
        daysOfWeek: [1, 3, 5],
        userId: user.id,
        streak: 2,
        bestStreak: 6,
      },
    }),
    prisma.habit.create({
      data: {
        title: 'قراءة كتاب في الشهر',
        description: 'إنهاء كتاب واحد كل شهر',
        type: 'MONTHLY',
        icon: 'Book',
        color: '#8b5cf6',
        period: 'MIDDLE',
        targetCount: 1,
        userId: user.id,
      },
    }),
  ]);
  console.log(`  ✓ ${habits.length} habits created`);

  // ─── Create Habit Logs ────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await prisma.habitLog.create({
      data: {
        habitId: habits[0].id,
        date,
        completed: true,
      },
    });
  }
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await prisma.habitLog.create({
      data: {
        habitId: habits[1].id,
        date,
        completed: true,
      },
    });
  }

  // ─── Create Calendar Events ───────────────────────────
  await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'اجتماع الفريق',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        type: 'TASK',
        userId: user.id,
        taskId: tasks[4].id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'موعد طبيب',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: new Date(new Date().setHours(14, 0, 0, 0)),
        type: 'CUSTOM',
        userId: user.id,
      },
    }),
  ]);

  // ─── Create Pomodoro Sessions ─────────────────────────
  await Promise.all([
    prisma.pomodoroSession.create({
      data: {
        duration: 25,
        breakDuration: 5,
        completed: true,
        userId: user.id,
        taskId: tasks[0].id,
        sessionDate: new Date(today),
      },
    }),
    prisma.pomodoroSession.create({
      data: {
        duration: 25,
        breakDuration: 5,
        completed: true,
        userId: user.id,
        taskId: tasks[0].id,
        sessionDate: new Date(today),
      },
    }),
    prisma.pomodoroSession.create({
      data: {
        duration: 25,
        breakDuration: 5,
        completed: true,
        userId: user.id,
        sessionDate: new Date(yesterday),
      },
    }),
  ]);

  // ─── Create Daily Stats ───────────────────────────────
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await prisma.dailyStats.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        tasksCompleted: Math.floor(Math.random() * 5),
        tasksCreated: Math.floor(Math.random() * 3),
        habitsCompleted: Math.floor(Math.random() * 4),
        focusMinutes: Math.floor(Math.random() * 60),
        focusSessions: Math.floor(Math.random() * 3),
      },
    });
  }

  // ─── Create Notifications ─────────────────────────────
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'WELCOME',
        title: 'أهلاً بك في My Taske! 🎉',
        message: 'تم إنشاء حساب تجريبي مع بيانات نموذجية.',
        userId: user.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'TASK_REMINDER',
        title: 'مهمة مستحقة غداً',
        message: 'لديك 3 مهام مستحقة غداً. تأكد من تجهيزها.',
        userId: user.id,
      },
    }),
  ]);

  console.log('\n✅ Seeding completed!');
  console.log(`\n📋 Demo Account:`);
  console.log(`   Email:    demo@my-taske.com`);
  console.log(`   Password: Demo1234`);
  console.log(`\n🚀 Start the backend with: npm run dev`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
