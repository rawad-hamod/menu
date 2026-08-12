
'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicMenu(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
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