'use client'

import { useLocale } from '@/app/components/LocaleProvider'

interface QrCodeTabProps {
  restaurantName: string
  slug: string
  menuUrl: string
  qrCodeDataUrl: string
}

export default function QrCodeTab({
  restaurantName,
  slug,
  menuUrl,
  qrCodeDataUrl,
}: QrCodeTabProps) {
  const { t } = useLocale()

  return (
    <section className="flex flex-col items-center gap-5 rounded-xl bg-white p-5 text-center shadow sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900">{t('menuQrCode')}</h2>
      <p className="max-w-lg text-sm text-gray-600">{t('scanToViewMenu')}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCodeDataUrl}
        alt={`${t('menuQrCode')} — ${restaurantName}`}
        width={256}
        height={256}
        className="h-56 w-56 rounded-lg border border-gray-200 bg-white p-2 sm:h-64 sm:w-64"
      />
      <p className="w-full break-all text-sm text-gray-500">{menuUrl}</p>
      <a
        href={qrCodeDataUrl}
        download={`${slug}-menu-qr.png`}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
      >
        {t('downloadQrCode')}
      </a>
    </section>
  )
}
