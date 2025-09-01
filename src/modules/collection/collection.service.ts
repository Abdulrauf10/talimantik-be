import { prisma } from '../../core/database/prisma';

interface UseQueryParams {
  page?: number;
  perPage?: number;
  subject?: string;
  level?: number;
  chapter?: number;
}

export async function getCollections({
  page = 1,
  perPage = 10,
  subject = '',
  level = 1,
  chapter = 1,
}: UseQueryParams) {
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (subject) {
    where.subject = { equals: subject };
  }

  if (level) {
    where.level = { equals: level };
  }

  if (chapter) {
    where.chapter = { equals: chapter };
  }

  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        chapter: true,
        level: true,
      },
    }),
    prisma.collection.count({ where }),
  ]);

  const totalPage = Math.ceil(total / perPage);
  const hasNextPage = page < totalPage;

  return {
    data: collections,
    meta: {
      page,
      perPage,
      total,
      totalPage,
      hasNextPage,
    },
  };
}
