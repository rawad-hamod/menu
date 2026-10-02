import Image from 'next/image'

interface MenuItemCardProps {
  name: string
  price: string
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
  restaurantName: string
  restaurantLogoUrl: string | null
}

export default function MenuItemCard({
  name,
  price,
  description,
  imageUrl,
  isAvailable,
  restaurantName,
  restaurantLogoUrl,
}: MenuItemCardProps) {
  const cardImage = imageUrl || restaurantLogoUrl

  return (
    <article
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        !isAvailable ? 'opacity-60' : ''
      }`}
    >
      {cardImage ? (
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Image
            src={cardImage}
            alt={imageUrl ? name : `${restaurantName} logo`}
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
          <h3 className="min-w-0 text-sm font-semibold text-gray-900 sm:text-base">{name}</h3>
          <span className="shrink-0 text-sm font-semibold text-amber-800 sm:text-base">{price}</span>
        </div>
        {!isAvailable && (
          <span className="mt-1 inline-block text-xs font-medium text-red-600">Sold Out</span>
        )}
        {description && (
          <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">{description}</p>
        )}
      </div>
    </article>
  )
}
