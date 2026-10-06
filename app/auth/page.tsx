'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { signUp, signIn } from '@/actions/auth'
import { useLocale } from '../components/LocaleProvider'
import { translateError } from '@/lib/i18n'

export default function AuthPage() {
  const { locale, t } = useLocale()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const action = isLogin ? signIn : signUp
      const result = await action(formData)

      if (result?.error) {
        setErrorMessage(translateError(locale, result.error))
        console.error('Auth error:', result.error)
        return
      }

      if (result?.success) {
        setSuccessMessage(isLogin ? t('signinSuccess') : t('signupSuccess'))
        window.setTimeout(() => router.push('/dashboard'), 500)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? t('login') : t('createAccount')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('restaurantName')}
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('restaurantNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('slug')}
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('slugPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('publicUrl')} your-domain.com/<span className="font-mono">my-pizza</span>
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">{t('minimumPassword')}</p>
            )}
          </div>

          {errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t('loading') : isLogin ? t('login') : t('createAccount')}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
        >
          {isLogin ? t('signupPrompt') : t('loginPrompt')}
        </button>
      </div>
    </div>
  )
}