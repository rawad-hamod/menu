
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

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
        <p className="text-gray-600">Welcome, {user.email}!</p>
        <p className="text-gray-500 mt-2">Your user ID: {user.id}</p>
        <p className="text-sm text-gray-400 mt-4">
          ✅ Auth works! Now we can build the menu editor.
        </p>
      </div>
    </div>
  )
}