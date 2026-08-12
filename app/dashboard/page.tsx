
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get the restaurant for this user
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: user.id },
    select: { slug: true, name: true }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-gray-600">Welcome, {user.email}!</p>
          {restaurant && (
            <div>
              <p className="text-gray-500">Your restaurant: <strong>{restaurant.name}</strong></p>
              <Link
                href={`/${restaurant.slug}`}
                target="_blank"
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                View your public menu →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}