
'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schemas
const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  restaurantId: z.string(),
})

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  sectionId: z.string(),
  isAvailable: z.boolean().default(true),
})

// Get all sections and items for a restaurant
export async function getRestaurantMenu(restaurantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      sections: {
        orderBy: { displayOrder: 'asc' },
        include: {
          items: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      },
    },
  })

  if (!restaurant) {
    return null
  }

  return {
    ...restaurant,
    sections: restaurant.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    })),
  }
}

// Create a new section
export async function createSection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    name: formData.get('name') as string,
    restaurantId: formData.get('restaurantId') as string,
  }

  const parsed = sectionSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    // Verify the restaurant belongs to this user
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      select: { id: true }
    })

    if (!restaurant) {
      return { error: 'Restaurant not found' }
    }

    await prisma.menuSection.create({
      data: {
        name: parsed.data.name,
        restaurantId: parsed.data.restaurantId,
        displayOrder: 0,
      }
    })

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error('Error creating section:', error)
    return { error: 'Failed to create section' }
  }
}

// Delete a section
export async function deleteSection(sectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.menuSection.delete({
      where: { id: sectionId }
    })

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting section:', error)
    return { error: 'Failed to delete section' }
  }
}

// Create a new item
export async function createItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || '',
    price: parseFloat(formData.get('price') as string),
    sectionId: formData.get('sectionId') as string,
    isAvailable: formData.get('isAvailable') === 'on',
  }

  const parsed = itemSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await prisma.menuItem.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        sectionId: parsed.data.sectionId,
        isAvailable: parsed.data.isAvailable,
        displayOrder: 0,
      }
    })

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error('Error creating item:', error)
    return { error: 'Failed to create item' }
  }
}

// Delete an item
export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.menuItem.delete({
      where: { id: itemId }
    })

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { error: 'Failed to delete item' }
  }
}

// Toggle item availability
export async function toggleItemAvailability(itemId: string, isAvailable: boolean) {
  const supabase =await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable }
    })

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error('Error toggling item:', error)
    return { error: 'Failed to update item' }
  }
}