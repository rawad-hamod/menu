import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Restaurant Not Found</h1>
      <p className="text-gray-600 mb-8">
        This restaurant doesn't exist or has been removed.
      </p>
      <Link
        href="/auth"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
      >
        Go Home
      </Link>
    </div>
  )
}