**Tianhui's Farewell Wall** — a community board where coworkers pin farewell notes (`/`) and share photos in a Memory Gallery (`/gallery`) for Tianhui. Built with [Next.js](https://nextjs.org) (App Router) and [Supabase](https://supabase.com) (Postgres + Storage) for persistence.

## Supabase setup

Notes and photos are stored in Supabase, so the app needs a project before it can save anything (until then it runs fine and just shows empty boards).

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `notes` and `photos` tables plus the public **`memories`** Storage bucket, all with Row Level Security allowing public read + insert (no edits/deletes). It's safe to re-run.
3. In **Settings → API**, copy the **Project URL** and the **anon / public** key into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart the dev server. The anon key is safe to expose — RLS limits it to reading and adding notes/photos. Gallery images are served from the `memories` bucket's public URLs (the Supabase host is already allowlisted in `next.config.ts`).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
