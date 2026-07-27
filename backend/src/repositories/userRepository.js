// ─── User Repository ───────────────────────────────────────

const prisma = require('../lib/prisma');

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

const userRepository = {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  async create(data) {
    return prisma.user.create({
      data,
      select: userSelect,
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });
  },

  async exists(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return !!user;
  },
};

module.exports = userRepository;
