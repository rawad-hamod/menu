'use client'

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { messages, type Locale, type TranslationKey } from '@/lib/i18n'
import type { Theme } from '@/lib/theme'

interface LocaleContextValue {
  locale: Locale
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: React.ReactNode
  initialLocale: Locale
  initialTheme: Theme
}) {
  const [locale, setLocale] = useState(initialLocale)
  const [theme, setTheme] = useState(initialTheme)
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === 'en' ? 'ar' : 'en'
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`
    setLocale(nextLocale)
    startTransition(() => router.refresh())
  }, [locale, router])

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`
    document.documentElement.dataset.theme = nextTheme
    setTheme(nextTheme)
  }, [theme])

  const value = {
    locale,
    t: (key: TranslationKey) => messages[locale][key],
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 end-4 z-50 flex gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-gray-50"
          aria-label={theme === 'light' ? messages[locale].darkMode : messages[locale].lightMode}
        >
          {theme === 'light' ? messages[locale].darkMode : messages[locale].lightMode}
        </button>
        <button
          type="button"
          onClick={toggleLocale}
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-gray-50"
          aria-label={locale === 'en' ? 'Switch language to Arabic' : 'تغيير اللغة إلى الإنجليزية'}
        >
          {messages[locale].language}
        </button>
      </div>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
