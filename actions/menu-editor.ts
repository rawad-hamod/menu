
'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
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

const itemUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  description: z.string().max(500, 'Description must be 500 characters or fewer'),
  price: z.coerce.number().finite().positive('Price must be greater than 0'),
})

const restaurantProfileSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name is required').max(120, 'Restaurant name must be 120 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer'),
})

// Get all sections and items for a restaurant
export async function getRestaurantMenu() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return null
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email.toLowerCase() },
      ],
    },
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

export async function updateRestaurantProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: 'Unauthorized' }
  }

  const parsed = restaurantProfileSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const imageValue = formData.get('logo')
  if (imageValue !== null && typeof imageValue !== 'string' && !(imageValue instanceof File)) {
    return { error: 'Invalid logo file' }
  }

  const logoFile = imageValue instanceof File && imageValue.size > 0 ? imageValue : null
  const imageExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  if (logoFile && !imageExtensions[logoFile.type]) {
    return { error: 'Logo must be a JPEG, PNG, or WebP file' }
  }
  if (logoFile && logoFile.size > 5 * 1024 * 1024) {
    return { error: 'Logo must be 5 MB or smaller' }
  }

  let uploadedLogoPath: string | null = null
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email.toLowerCase() },
        ],
      },
      select: { id: true, slug: true, logoUrl: true },
    })

    if (!restaurant) {
      return { error: 'Restaurant not found' }
    }

    let logoUrl = restaurant.logoUrl
    if (logoFile) {
      const extension = imageExtensions[logoFile.type]
      uploadedLogoPath = `${user.id}/${randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from('menu-item-images')
        .upload(uploadedLogoPath, await logoFile.arrayBuffer(), {
          contentType: logoFile.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Supabase Storage logo upload failed:', uploadError)
        return { error: `Logo upload failed: ${uploadError.message}` }
      }

      logoUrl = supabase.storage.from('menu-item-images').getPublicUrl(uploadedLogoPath).data.publicUrl
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        logoUrl,
      },
    })

    if (logoFile && restaurant.logoUrl) {
      const publicUrlPrefix = supabase.storage.from('menu-item-images').getPublicUrl('').data.publicUrl
      if (restaurant.logoUrl.startsWith(publicUrlPrefix)) {
        const oldLogoPath = decodeURIComponent(restaurant.logoUrl.slice(publicUrlPrefix.length))
        await supabase.storage.from('menu-item-images').remove([oldLogoPath])
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/${restaurant.slug}`)
    return { success: true }
  } catch (error) {
    if (uploadedLogoPath) {
      await supabase.storage.from('menu-item-images').remove([uploadedLogoPath])
    }
    console.error('Error updating restaurant profile:', error)
    return { error: 'Failed to update restaurant profile' }
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

  const imageValue = formData.get('image')
  if (imageValue !== null && typeof imageValue !== 'string' && !(imageValue instanceof File)) {
    return { error: 'Invalid image file' }
  }

  const imageFile = imageValue instanceof File && imageValue.size > 0 ? imageValue : null
  const imageExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  if (imageFile && !imageExtensions[imageFile.type]) {
    return { error: 'Image must be a JPEG, PNG, or WebP file' }
  }
  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    return { error: 'Image must be 5 MB or smaller' }
  }

  let uploadedImagePath: string | null = null
  try {
    const ownerConditions = [
      { id: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
    ]
    const section = await prisma.menuSection.findFirst({
      where: {
        id: parsed.data.sectionId,
        restaurant: { is: { OR: ownerConditions } },
      },
      select: { restaurant: { select: { slug: true } } },
    })

    if (!section) {
      return { error: 'Menu section not found' }
    }

    let imageUrl: string | null = null
    if (imageFile) {
      const extension = imageExtensions[imageFile.type]
      uploadedImagePath = `${user.id}/${randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from('menu-item-images')
        .upload(uploadedImagePath, await imageFile.arrayBuffer(), {
          contentType: imageFile.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Supabase Storage upload failed:', uploadError)
        return { error: `Image upload failed: ${uploadError.message}` }
      }
      imageUrl = supabase.storage.from('menu-item-images').getPublicUrl(uploadedImagePath).data.publicUrl
    }

    await prisma.menuItem.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        imageUrl,
        sectionId: parsed.data.sectionId,
        isAvailable: parsed.data.isAvailable,
        displayOrder: 0,
      }
    })

    revalidatePath(`/dashboard`)
    revalidatePath(`/${section.restaurant.slug}`)
    return { success: true }
  } catch (error) {
    if (uploadedImagePath) {
      await supabase.storage.from('menu-item-images').remove([uploadedImagePath])
    }
    console.error('Error creating item:', error)
    return { error: 'Failed to create item' }
  }
}

export async function updateItem(itemId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = itemUpdateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const ownerConditions = [
      { id: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
    ]
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        section: {
          is: { restaurant: { is: { OR: ownerConditions } } },
        },
      },
      select: { section: { select: { restaurant: { select: { slug: true } } } } },
    })

    if (!item) {
      return { error: 'Menu item not found' }
    }

    await prisma.menuItem.update({
      where: { id: itemId },
      data: parsed.data,
    })

    revalidatePath('/dashboard')
    revalidatePath(`/${item.section.restaurant.slug}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating item:', error)
    return { error: 'Failed to update item' }
  }
}

export async function updateItemPhoto(itemId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const imageValue = formData.get('image')
  if (!(imageValue instanceof File) || imageValue.size === 0) {
    return { error: 'Choose an image to upload' }
  }

  const imageExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  if (!imageExtensions[imageValue.type]) {
    return { error: 'Image must be a JPEG, PNG, or WebP file' }
  }
  if (imageValue.size > 5 * 1024 * 1024) {
    return { error: 'Image must be 5 MB or smaller' }
  }

  let uploadedImagePath: string | null = null
  try {
    const ownerConditions = [
      { id: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
    ]
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        section: {
          is: { restaurant: { is: { OR: ownerConditions } } },
        },
      },
      select: {
        imageUrl: true,
        section: { select: { restaurant: { select: { slug: true } } } },
      },
    })

    if (!item) {
      return { error: 'Menu item not found' }
    }

    const extension = imageExtensions[imageValue.type]
    uploadedImagePath = `${user.id}/${randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('menu-item-images')
      .upload(uploadedImagePath, await imageValue.arrayBuffer(), {
        contentType: imageValue.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase Storage upload failed:', uploadError)
      return { error: `Image upload failed: ${uploadError.message}` }
    }

    const imageUrl = supabase.storage.from('menu-item-images').getPublicUrl(uploadedImagePath).data.publicUrl
    await prisma.menuItem.update({ where: { id: itemId }, data: { imageUrl } })

    if (item.imageUrl) {
      const publicUrlPrefix = supabase.storage.from('menu-item-images').getPublicUrl('').data.publicUrl
      if (item.imageUrl.startsWith(publicUrlPrefix)) {
        const oldImagePath = decodeURIComponent(item.imageUrl.slice(publicUrlPrefix.length))
        await supabase.storage.from('menu-item-images').remove([oldImagePath])
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/${item.section.restaurant.slug}`)
    return { success: true }
  } catch (error) {
    if (uploadedImagePath) {
      await supabase.storage.from('menu-item-images').remove([uploadedImagePath])
    }
    console.error('Error updating item photo:', error)
    return { error: 'Failed to update item photo' }
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
    const ownerConditions = [
      { id: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
    ]
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        section: {
          is: { restaurant: { is: { OR: ownerConditions } } },
        },
      },
      select: {
        imageUrl: true,
        section: { select: { restaurant: { select: { slug: true } } } },
      },
    })

    if (!item) {
      return { error: 'Menu item not found' }
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    })

    if (item.imageUrl) {
      try {
        const publicUrlPrefix = supabase.storage.from('menu-item-images').getPublicUrl('').data.publicUrl
        if (item.imageUrl.startsWith(publicUrlPrefix)) {
          const imagePath = decodeURIComponent(item.imageUrl.slice(publicUrlPrefix.length))
          const { error: removeError } = await supabase.storage.from('menu-item-images').remove([imagePath])
          if (removeError) {
            console.error('Supabase Storage item image cleanup failed:', removeError)
          }
        }
      } catch (error) {
        console.error('Supabase Storage item image cleanup failed:', error)
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/${item.section.restaurant.slug}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { error: 'Failed to delete item' }
  }
}

// Toggle item availability
export async function toggleItemAvailability(itemId: string, isAvailable: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const ownerConditions = [
      { id: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
    ]
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        section: {
          is: { restaurant: { is: { OR: ownerConditions } } },
        },
      },
      select: { section: { select: { restaurant: { select: { slug: true } } } } },
    })

    if (!item) {
      return { error: 'Menu item not found' }
    }

    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable }
    })

    revalidatePath(`/dashboard`)
    revalidatePath(`/${item.section.restaurant.slug}`)
    return { success: true }
  } catch (error) {
    console.error('Error toggling item:', error)
    return { error: 'Failed to update item' }
  }
}