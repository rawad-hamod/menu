
'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicMenu(slug: string) {
  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: { equals: normalizedSlug, mode: 'insensitive' } },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      sections: {
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          displayOrder: true,
          items: {
            orderBy: { displayOrder: 'asc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  })

  return restaurant
}