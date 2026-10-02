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
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            {restaurant.logoUrl && (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-amber-50">
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="mt-2 max-w-2xl text-gray-600">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
        {restaurant.sections.length > 0 && (
          <nav
            aria-label="Menu categories"
            className="overflow-x-auto overscroll-x-contain border-t border-gray-100"
          >
            <div className="mx-auto flex w-max min-w-full justify-center gap-2 px-4 sm:px-6">
              {restaurant.sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/${normalizedSlug}?category=${encodeURIComponent(section.id)}`}
                  aria-current={restaurant.selectedSection?.id === section.id ? 'page' : undefined}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    restaurant.selectedSection?.id === section.id
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {section.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {restaurant.sections.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            This restaurant has not added any menu items yet.
          </p>
        ) : (
          <div>
            {restaurant.selectedSection && (
              <section key={restaurant.selectedSection.id}>
                <h2 className="mb-5 text-2xl font-semibold text-gray-900">
                  {restaurant.selectedSection.name}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                  {restaurant.selectedSection.items.length === 0 ? (
                    <p className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                      No items in this section
                    </p>
                  ) : (
                    restaurant.selectedSection.items.map((item) => (
                      <article
                        key={item.id}
                        className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
                          !item.isAvailable ? 'opacity-60' : ''
                        }`}
                      >
                        {item.imageUrl || restaurant.logoUrl ? (
                          <div className="relative aspect-[4/3] w-full bg-gray-100">
                            <Image
                              src={item.imageUrl || restaurant.logoUrl!}
                              alt={item.imageUrl ? item.name : `${restaurant.name} logo`}
                              fill
                              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                            No image available
                          </div>
                        )}
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="min-w-0 text-sm font-semibold text-gray-900 sm:text-base">
                              {item.name}
                            </h3>
                            <span className="shrink-0 text-sm font-semibold text-amber-800 sm:text-base">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                          {!item.isAvailable && (
                            <span className="mt-1 inline-block text-xs font-medium text-red-600">
                              Sold Out
                            </span>
                          )}
                          {item.description && (
                            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}