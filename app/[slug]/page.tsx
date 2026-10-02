import { getPublicMenu } from '@/actions/menu'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
  params: { slug: string } | Promise<{ slug: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = (await params) as { slug: string }
  const { category } = await searchParams
  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const restaurant = await getPublicMenu(normalizedSlug, category)

  if (!restaurant) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {restaurant.logoUrl && (
              <div className="w-24 h-24 relative shrink-0">
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-gray-600 mt-1">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {restaurant.sections.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            This restaurant has not added any menu items yet.
          </p>
        ) : (
          <div>
            <nav aria-label="Menu categories" className="mb-8 flex gap-2 overflow-x-auto border-b">
              {restaurant.sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/${normalizedSlug}?category=${encodeURIComponent(section.id)}`}
                  aria-current={restaurant.selectedSection?.id === section.id ? 'page' : undefined}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    restaurant.selectedSection?.id === section.id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {section.name}
                </Link>
              ))}
            </nav>

            {restaurant.selectedSection && (
              <section key={restaurant.selectedSection.id}>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                  {restaurant.selectedSection.name}
                </h2>
                <div className="grid gap-4">
                  {restaurant.selectedSection.items.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items in this section</p>
                  ) : (
                    restaurant.selectedSection.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 bg-white rounded-lg shadow-sm border ${
                          !item.isAvailable ? 'opacity-50' : ''
                        }`}
                      >
                        {item.imageUrl || restaurant.logoUrl ? (
                          <div className="w-24 h-24 relative shrink-0">
                            <Image
                              src={item.imageUrl || restaurant.logoUrl!}
                              alt={item.imageUrl ? item.name : `${restaurant.name} logo`}
                              fill
                              sizes="96px"
                              className="object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">
                                {item.name}
                                {!item.isAvailable && (
                                  <span className="ml-2 text-sm text-red-500 font-normal">
                                    Sold Out
                                  </span>
                                )}
                              </h3>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-lg whitespace-nowrap ml-4">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}