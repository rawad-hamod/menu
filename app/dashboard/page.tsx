// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { getRestaurantMenu } from '@/actions/menu-editor'
import Link from 'next/link'
import MenuEditor from '../components/MenuEditor'
import { getLocale } from '@/lib/locale-server'
import { translate } from '@/lib/i18n'

export default async function DashboardPage() {
  const locale = await getLocale()
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const supabase = await createClient()
  console.log('Supabase client created:', supabase.auth.getUser())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get restaurant data with menu
  const restaurant = await getRestaurantMenu();
  console.log(restaurant)

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form action={signOut}>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition"
              >
                {t('signOut')}
              </button>
            </form>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold mb-4">{t('restaurantNotFound')}</h1>
            <p className="text-gray-600">{t('contactSupport')}</p>
          </div>
        </div>

      </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
            <p className="text-sm text-gray-500">{restaurant.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm"
            >
              {t('viewMenu')}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition"
              >
                {t('signOut')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Menu Editor */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MenuEditor restaurant={restaurant} />
      </div>
    </div>
  )
}