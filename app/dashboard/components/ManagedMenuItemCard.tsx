import type { DashboardItem } from './types'

interface ManagedMenuItemCardProps {
  item: DashboardItem
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  isPending: boolean
  labels: {
    activate: string
    deactivate: string
    delete: string
    edit: string
    noImage: string
    soldOut: string
  }
}

export default function ManagedMenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggle,
  isPending,
  labels,
}: ManagedMenuItemCardProps) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {item.imageUrl ? (
        <div className="aspect-[4/3] w-full bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100 px-3 text-sm text-gray-400">
          {labels.noImage}
        </div>
      )}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-sm font-semibold text-gray-900 sm:text-base">
            {item.name}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-amber-800 sm:text-base">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
            {item.description}
          </p>
        )}
        {!item.isAvailable && (
          <span className="mt-2 text-xs font-medium text-red-600">{labels.soldOut}</span>
        )}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onEdit}
            disabled={isPending}
            className="min-h-10 rounded-md px-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 sm:text-sm"
          >
            {labels.edit}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="min-h-10 rounded-md px-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:text-sm"
          >
            {labels.delete}
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={isPending}
            className="min-h-10 rounded-md px-2 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50 sm:text-sm"
          >
            {item.isAvailable ? labels.deactivate : labels.activate}
          </button>
        </div>
      </div>
    </article>
  )
}
