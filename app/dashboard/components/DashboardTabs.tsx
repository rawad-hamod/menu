'use client'

import { useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'
import CategoriesTab from './CategoriesTab'
import QrCodeTab from './QrCodeTab'
import RestaurantSettingsTab from './RestaurantSettingsTab'
import type { DashboardRestaurant } from './types'

type Tab = 'categories' | 'settings' | 'qr'

interface DashboardTabsProps {
  restaurant: DashboardRestaurant
  qrCodeDataUrl: string
  menuUrl: string
}

export default function DashboardTabs({
  restaurant,
  qrCodeDataUrl,
  menuUrl,
}: DashboardTabsProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<Tab>('categories')
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'categories', label: t('categoriesTab') },
    { id: 'settings', label: t('settingsTab') },
    { id: 'qr', label: t('qrCodeTab') },
  ]

  return (
    <div>
      <nav
        aria-label={t('dashboardSections')}
        role="tablist"
        className="mb-5 flex overflow-x-auto border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            id={`dashboard-tab-${tab.id}`}
            aria-controls={`dashboard-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            role="tab"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-12 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors sm:px-6 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        id={`dashboard-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`dashboard-tab-${activeTab}`}
      >
        {activeTab === 'categories' && <CategoriesTab restaurant={restaurant} />}
        {activeTab === 'settings' && <RestaurantSettingsTab restaurant={restaurant} />}
        {activeTab === 'qr' && (
          <QrCodeTab
            restaurantName={restaurant.name}
            slug={restaurant.slug}
            menuUrl={menuUrl}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        )}
      </div>
    </div>
  )
}
