import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';

interface UseQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function getMe(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      age: true,
      gender: true,
      createdAt: true,
    },
  });
}

export async function getUsers({
  page = 1,
  perPage = 10,
  search = '',
}: UseQueryParams) {
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            name: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
          },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        age: true,
        gender: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const hasNextPage = page < totalPages;

  return {
    data: users,
    meta: {
      page,
      perPage,
      total,
      totalPages,
      hasNextPage,
    },
  };
}

export async function createUser(data: {
  username: string;
  email?: string;
  name: string;
  passwordHash?: string;
  phone?: string;
  city?: string;
  age?: number;
  gender?: 'laki_laki' | 'perempuan';
}) {
  return prisma.user.create({ data });
}

export async function updateUser(
  id: string,
  data: Partial<{
    username: string;
    email?: string;
    name?: string;
    passwordHash?: string;
    phone?: string;
    city?: string;
    age?: number;
    gender?: 'laki_laki' | 'perempuan';
  }>,
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
