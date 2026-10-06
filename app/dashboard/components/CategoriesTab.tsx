'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  createItem,
  createSection,
  deleteItem,
  deleteSection,
  toggleItemAvailability,
  updateItem,
  updateItemPhoto,
} from '@/actions/menu-editor'
import { useLocale } from '@/app/components/LocaleProvider'
import { translateError } from '@/lib/i18n'
import ManagedMenuItemCard from './ManagedMenuItemCard'
import type { DashboardItem, DashboardRestaurant } from './types'

interface CategoriesTabProps {
  restaurant: DashboardRestaurant
}

export default function CategoriesTab({ restaurant }: CategoriesTabProps) {
  const { locale, t } = useLocale()
  const router = useRouter()
  const [selectedSectionId, setSelectedSectionId] = useState(restaurant.sections[0]?.id ?? '')
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const selectedSection =
    restaurant.sections.find((section) => section.id === selectedSectionId) ??
    restaurant.sections[0]

  const runAction = (action: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setError(translateError(locale, result.error))
        return
      }

      onSuccess?.()
      router.refresh()
    })
  }

  const handleCreateSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    runAction(() => createSection(formData), () => form.reset())
  }

  const handleCreateItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    runAction(() => createItem(formData), () => form.reset())
  }

  const handleDeleteSection = () => {
    if (!selectedSection || !window.confirm(t('deleteSectionConfirm'))) return
    runAction(() => deleteSection(selectedSection.id), () => setSelectedSectionId(''))
  }

  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm(t('deleteItemConfirm'))) return
    runAction(() => deleteItem(itemId))
  }

  const handleToggleAvailability = (item: DashboardItem) => {
    runAction(() => toggleItemAvailability(item.id, !item.isAvailable))
  }

  const handleUpdateItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingItem) return

    const formData = new FormData(event.currentTarget)
    const image = formData.get('image')
    const photoFormData = new FormData()
    if (image instanceof File && image.size > 0) {
      photoFormData.set('image', image)
    }

    runAction(async () => {
      const result = await updateItem(editingItem.id, formData)
      if (result.error) return result
      if (image instanceof File && image.size > 0) {
        return updateItemPhoto(editingItem.id, photoFormData)
      }
      return result
    }, () => setEditingItem(null))
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="break-words rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section aria-label={t('menuCategories')} className="rounded-xl bg-white p-4 shadow sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('menuCategories')}</h2>
          <form onSubmit={handleCreateSection} className="flex w-full gap-2 sm:w-auto">
            <input
              type="text"
              name="name"
              placeholder={t('sectionNamePlaceholder')}
              aria-label={t('sectionName')}
              required
              className="min-h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-56"
            />
            <input type="hidden" name="restaurantId" value={restaurant.id} />
            <button
              type="submit"
              disabled={isPending}
              className="min-h-10 shrink-0 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 sm:px-4"
            >
              {t('addSection')}
            </button>
          </form>
        </div>

        {restaurant.sections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            {t('noSections')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {restaurant.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                aria-pressed={selectedSection?.id === section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`flex aspect-square min-w-0 items-center justify-center rounded-xl border p-3 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:p-4 sm:text-base ${
                  selectedSection?.id === section.id
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="line-clamp-3 break-words">{section.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedSection && (
        <section className="rounded-xl bg-white p-4 shadow sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-xl font-semibold text-gray-900">
              {selectedSection.name}
            </h2>
            <button
              type="button"
              onClick={handleDeleteSection}
              disabled={isPending}
              className="min-h-10 rounded-md px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {t('deleteSection')}
            </button>
          </div>

          <form
            onSubmit={handleCreateItem}
            className="mb-6 grid min-w-0 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4"
          >
            <input type="hidden" name="sectionId" value={selectedSection.id} />
            <input
              type="text"
              name="name"
              placeholder={t('itemNamePlaceholder')}
              aria-label={t('itemName')}
              required
              className="min-h-10 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              name="description"
              placeholder={t('itemDescriptionPlaceholder')}
              className="min-h-10 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="number"
              name="price"
              placeholder={t('price')}
              min="0.01"
              step="0.01"
              required
              className="min-h-10 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <label className="flex min-w-0 flex-col gap-1 text-xs text-gray-600 sm:col-span-2 lg:col-span-1">
              {t('itemPhoto')}
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                className="w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-gray-200 file:px-2 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
              />
            </label>
            <label className="flex min-h-10 items-center gap-2 text-sm text-gray-700 sm:col-span-2 lg:col-span-2">
              <input type="checkbox" name="isAvailable" defaultChecked className="h-4 w-4" />
              {t('available')}
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-10 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 sm:col-span-2 lg:col-span-2 lg:justify-self-end"
            >
              {isPending ? t('loading') : t('addItem')}
            </button>
          </form>

          {selectedSection.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
              {t('noItemsInSection')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {selectedSection.items.map((item) => (
                <ManagedMenuItemCard
                  key={item.id}
                  item={item}
                  isPending={isPending}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                  onToggle={() => handleToggleAvailability(item)}
                  labels={{
                    activate: t('activateItem'),
                    deactivate: t('deactivateItem'),
                    delete: t('deleteItem'),
                    edit: t('editItem'),
                    noImage: t('noImageAvailable'),
                    soldOut: t('soldOut'),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditingItem(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setEditingItem(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-item-title"
            className="my-auto max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id="edit-item-title" className="text-lg font-semibold text-gray-900">
                {t('editItem')}: {editingItem.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                aria-label={t('cancel')}
                className="min-h-10 min-w-10 rounded-md text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                {t('itemName')}
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                  autoFocus
                  className="min-h-11 rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                {t('description')}
                <textarea
                  name="description"
                  defaultValue={editingItem.description ?? ''}
                  maxLength={500}
                  rows={3}
                  className="resize-y rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                {t('price')}
                <input
                  type="number"
                  name="price"
                  defaultValue={Number(editingItem.price).toFixed(2)}
                  min="0.01"
                  step="0.01"
                  required
                  className="min-h-11 rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                {t('itemPhoto')}
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
                />
              </label>
              {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setEditingItem(null)}
                  className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? t('loading') : t('saveChanges')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
