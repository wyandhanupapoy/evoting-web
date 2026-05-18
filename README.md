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

## UI/UX Customization (Adjustable Content)

Konten utama halaman publik sekarang bisa diatur dari `.env.local` tanpa ubah komponen satu per satu.

Gunakan variabel berikut:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_HERO_BADGE`
- `NEXT_PUBLIC_HERO_TITLE`
- `NEXT_PUBLIC_HERO_SUBTITLE`
- `NEXT_PUBLIC_VOTE_BUTTON_LABEL`
- `NEXT_PUBLIC_CANDIDATE_SECTION_TITLE`
- `NEXT_PUBLIC_VOTE_UNIT_LABEL`
- `NEXT_PUBLIC_VOTE_PRICE`
- `NEXT_PUBLIC_VOTE_FORM_TITLE`
- `NEXT_PUBLIC_VOTE_FORM_DESCRIPTION`
- `NEXT_PUBLIC_VOTE_INPUT_LABEL`
- `NEXT_PUBLIC_VOTE_INPUT_PLACEHOLDER`
- `NEXT_PUBLIC_PAYMENT_BUTTON_PREFIX`
- `NEXT_PUBLIC_TEST_PAY_BUTTON_LABEL`
- `NEXT_PUBLIC_TEST_PAY_HELPER_TEXT`
- `NEXT_PUBLIC_ENABLE_MIDTRANS_TEST_APPROVAL`
- `NEXT_PUBLIC_ADMIN_DASHBOARD_TITLE`
- `NEXT_PUBLIC_ADMIN_DASHBOARD_SUBTITLE`
- `NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_MB`
- `NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_WIDTH`
- `NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_HEIGHT`

Mode Midtrans juga disamakan antara server dan client:

- `MIDTRANS_IS_PRODUCTION`
- `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`

Setelah mengubah `.env.local`, restart dev server.

## Pengaturan Biaya Vote oleh Admin

Dashboard admin sekarang bisa mengubah biaya per vote secara langsung.

Agar fitur ini berjalan, buat tabel `app_settings` di Supabase dengan script:

- `supabase/app_settings.sql`

Nilai yang dipakai sistem:

- key: `vote_price`
- value: angka Rupiah (contoh `10000`)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
