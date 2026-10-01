
'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import {
  createSection,
  deleteSection,
  createItem,
  deleteItem,
  toggleItemAvailability,
  updateItemPhoto,
  updateRestaurantProfile,
} from '@/actions/menu-editor'

type Section = {
  id: string
  name: string
  displayOrder: number
  items: Array<{
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    isAvailable: boolean
    displayOrder: number
  }>
}

interface MenuEditorProps {
  restaurant: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    sections: Section[]
  }
}

export default function MenuEditor({ restaurant }: MenuEditorProps) {
  const [sections] = useState(restaurant.sections)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Add section handler
  const handleAddSection = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createSection(formData)
      if (result.error) {
        setError(result.error)
      } else {
        // Refresh the page to show new section
        window.location.reload()
      }
    })
  }

  const handleUpdateRestaurantProfile = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await updateRestaurantProfile(formData)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Delete section handler
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its items?')) return
    
    setError(null)
    startTransition(async () => {
      const result = await deleteSection(sectionId)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Add item handler
  const handleAddItem = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createItem(formData)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Delete item handler
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return
    
    setError(null)
    startTransition(async () => {
      const result = await deleteItem(itemId)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  const handleUpdateItemPhoto = async (itemId: string, formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await updateItemPhoto(itemId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Toggle availability
  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const result = await toggleItemAvailability(itemId, !currentStatus)
      if (result.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Restaurant profile</h2>
        <form action={handleUpdateRestaurantProfile} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Description
            <textarea
              name="description"
              defaultValue={restaurant.description ?? ''}
              maxLength={500}
              rows={4}
              placeholder="Tell customers about your restaurant"
              className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Restaurant logo (optional, JPEG, PNG, or WebP; max 5 MB)
              <input
                type="file"
                name="logo"
                accept="image/jpeg,image/png,image/webp"
                className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
              />
            </label>
            {restaurant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={restaurant.logoUrl} alt="Current restaurant logo" className="h-20 w-20 rounded-full border object-cover" />
            )}
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Save restaurant profile
            </button>
          </div>
        </form>
      </section>

      {/* Add Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add Section</h2>
        <form action={handleAddSection} className="flex gap-4">
          <input type="hidden" name="restaurantId" value={restaurant.id} />
          <input
            type="text"
            name="name"
            placeholder="Section name (e.g., Starters)"
            required
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
          >
            Add Section
          </button>
        </form>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No sections yet. Add your first section above!
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{section.name}</h3>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  disabled={isPending}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  Delete Section
                </button>
              </div>

              {/* Add Item Form */}
              <div className="bg-gray-50 rounded p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Item</h4>
                <form action={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="hidden" name="sectionId" value={section.id} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Item name"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    step="0.01"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
                    Item photo (optional, JPEG, PNG, or WebP; max 5 MB)
                    <input
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/webp"
                      className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
                    />
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isAvailable" defaultChecked />
                      Available
                    </label>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>

              {/* Items List */}
              {section.items.length === 0 ? (
                <p className="text-gray-400 text-sm">No items in this section</p>
              ) : (
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-3 border rounded hover:bg-gray-50 sm:flex-row sm:justify-between sm:items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${!item.isAvailable ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                          </span>
                          {!item.isAvailable && (
                            <span className="text-xs text-red-500 font-medium">Sold Out</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <form action={handleUpdateItemPhoto.bind(null, item.id)} className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            aria-label={`Photo for ${item.name}`}
                            className="max-w-40 text-xs file:rounded file:border-0 file:bg-gray-200 file:px-2 file:py-1 file:text-gray-700"
                          />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50"
                          >
                            {item.imageUrl ? 'Replace photo' : 'Add photo'}
                          </button>
                        </form>
                        <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                          disabled={isPending}
                          className={`px-2 py-1 rounded text-xs transition ${
                            item.isAvailable
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isPending}
                          className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}