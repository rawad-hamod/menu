// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { getRestaurantMenu } from '@/actions/menu-editor'
import Link from 'next/link'
import DashboardTabs from './components/DashboardTabs'
import { getLocale } from '@/lib/locale-server'
import { translate } from '@/lib/i18n'
import QRCode from 'qrcode'

export default async function DashboardPage() {
  const locale = await getLocale()
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get restaurant data with menu
  const restaurant = await getRestaurantMenu();

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow sm:p-8">
          <div className="mb-6 flex justify-end">
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
              >
                {t('signOut')}
              </button>
            </form>
          </div>
          <h1 className="mb-4 text-xl font-semibold">{t('restaurantNotFound')}</h1>
          <p className="text-gray-600">{t('contactSupport')}</p>
        </div>
      </div>
    )
  }

  const menuUrl = new URL(
    `/${encodeURIComponent(restaurant.slug)}`,
    'https://menu-six-sigma.vercel.app/',
  )
  const qrCodeDataUrl = await QRCode.toDataURL(menuUrl.toString(), {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 256,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{t('dashboard')}</h1>
            <p className="text-sm text-gray-500">{restaurant.name}</p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-gray-200 px-3 text-center text-sm text-blue-600 hover:bg-gray-50 hover:underline sm:flex-none sm:border-0 sm:px-0"
            >
              {t('viewMenu')}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-10 whitespace-nowrap rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
              >
                {t('signOut')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
        <DashboardTabs
          restaurant={restaurant}
          qrCodeDataUrl={qrCodeDataUrl}
          menuUrl={menuUrl.toString()}
        />
      </main>
    </div>
  )
}