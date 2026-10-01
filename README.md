This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Menu Item Photos

Run this in the Supabase SQL Editor for the same project configured by `NEXT_PUBLIC_SUPABASE_URL`. It creates or configures a public bucket named `menu-item-images` with a 5 MB file size limit and JPEG, PNG, and WebP allowed MIME types, then adds policies so signed-in owners can upload into their own user-ID folder and failed database writes can remove the uploaded file:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'menu-item-images',
	'menu-item-images',
	true,
	5242880,
	array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
		file_size_limit = excluded.file_size_limit,
		allowed_mime_types = excluded.allowed_mime_types;

create policy "Owners upload menu item photos"
on storage.objects for insert to authenticated
with check (
	bucket_id = 'menu-item-images'
	and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Owners delete menu item photos"
on storage.objects for delete to authenticated
using (
	bucket_id = 'menu-item-images'
	and (storage.foldername(name))[1] = (select auth.uid()::text)
);
```

The bucket must be public because public menus display photos using their public URLs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
