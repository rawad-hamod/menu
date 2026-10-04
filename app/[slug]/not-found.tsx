import Link from 'next/link'
import { getLocale } from '@/lib/locale-server'
import { translate } from '@/lib/i18n'

export default async function NotFound() {
  const locale = await getLocale()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{translate(locale, 'restaurantNotFoundTitle')}</h1>
      <p className="text-gray-600 mb-8">
        {translate(locale, 'restaurantMissing')}
      </p>
      <Link
        href="/auth"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
      >
        {translate(locale, 'goHome')}
      </Link>
    </div>
  )
}