'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updateRestaurantProfile } from '@/actions/menu-editor'
import { useLocale } from '@/app/components/LocaleProvider'
import { translateError } from '@/lib/i18n'
import type { DashboardRestaurant } from './types'

interface RestaurantSettingsTabProps {
  restaurant: DashboardRestaurant
}

export default function RestaurantSettingsTab({ restaurant }: RestaurantSettingsTabProps) {
  const { locale, t } = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateRestaurantProfile(formData)
      if (result.error) {
        setError(translateError(locale, result.error))
        return
      }

      setSuccess(true)
      router.refresh()
    })
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow sm:p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{t('restaurantProfile')}</h2>
      <form
        onSubmit={handleSubmit}
        className="grid min-w-0 gap-5 md:grid-cols-2"
      >
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-gray-700">
          {t('restaurantName')}
          <input
            type="text"
            name="name"
            required
            maxLength={120}
            defaultValue={restaurant.name}
            className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-gray-700 md:row-span-2">
          {t('description')}
          <textarea
            name="description"
            defaultValue={restaurant.description ?? ''}
            maxLength={500}
            rows={5}
            placeholder={t('restaurantDescriptionPlaceholder')}
            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <div className="flex min-w-0 flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            {t('restaurantLogo')}
            <input
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
            />
          </label>
          {restaurant.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logoUrl}
              alt={t('currentRestaurantLogo')}
              className="h-20 w-20 rounded-full border border-gray-200 object-cover"
            />
          )}
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 md:col-span-2">
            {t('profileSaved')}
          </p>
        )}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 w-full rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isPending ? t('loading') : t('saveRestaurantProfile')}
          </button>
        </div>
      </form>
    </section>
  )
}
