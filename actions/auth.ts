
'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
  restaurantName: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    email: (formData.get('email')?.toString() ?? '').trim(),
    password: (formData.get('password')?.toString() ?? '').trim(),
    restaurantName: (formData.get('restaurantName')?.toString() ?? '').trim(),
    slug: (formData.get('slug')?.toString() ?? '').trim(),
  }

  const parsed = signUpSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // 1. Sign up with Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        restaurant_name: parsed.data.restaurantName,
        slug: parsed.data.slug,
      },
    },
  })

  if (signUpError) {
    const msg = String(signUpError.message ?? '')
    if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
      return { error: 'Too many verification emails were sent. Please wait a few minutes and try again.' }
    }
    return { error: msg }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Failed to create user' }

  const normalizedEmail = parsed.data.email.toLowerCase()

  const existingRestaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ slug: parsed.data.slug }, { email: normalizedEmail }],
    },
    select: { id: true, slug: true, email: true },
  })

  if (existingRestaurant) {
    const field = existingRestaurant.slug === parsed.data.slug ? 'slug' : 'email'
    return { error: `A restaurant with this ${field} already exists.` }
  }

  // 2. Create the restaurant record linked to the auth user ID
  try {
    await prisma.restaurant.create({
      data: {
        id: userId,
        email: normalizedEmail,
        name: parsed.data.restaurantName,
        slug: parsed.data.slug,
      },
    })
    console.log('Restaurant profile created successfully for user ID:', userId)
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return { error: 'A restaurant with this slug or email already exists.' }
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P1001'
    ) {
      return { error: 'Database connection failed. Please try again in a moment.' }
    }

    console.error('Prisma error:', error)
    return { error: 'Failed to create the restaurant profile.' }
  }

  return {
    success: true,
    message: 'Account created successfully. Redirecting to your dashboard...',
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: 'Signed in successfully. Redirecting to your dashboard...',
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}