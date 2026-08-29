# 🪐 Boon.dev — Dynamic Portfolio + CMS

A fully dynamic personal portfolio redesigned around a headless CMS. All content
(projects, blog, honors, resources, skills, timeline, navigation, site config) is
managed from a custom admin panel (React) and served live from **Supabase** on a
static Astro public site.

## ✨ What's changed

| | Old (static) | New (dynamic) |
|---|---|---|
| Projects | hardcoded HTML | Supabase `projects` |
| Blog | `posts.json` + JS | Supabase `blog_posts` + tags |
| Honors | `prizes.json` | Supabase `honors` |
| Resources | hardcoded | Supabase `resources` |
| Nav / site config | hardcoded | Supabase `nav_links` + `site_config` |
| Admin | none | Custom React CMS |
| Design | cosmic scrollytelling | Clean academic light theme |

## 🗂️ Repo layout

```
├── site/                 # Public site — Astro + TypeScript
│   ├── src/pages/        # index, about, projects, blog, honors, resources, 404
│   ├── src/components/   # Navbar, Footer
│   ├── src/layouts/      # Base layout
│   ├── src/lib/          # supabase client, data store, demo fallback, types
│   └── src/styles/       # global.css (design tokens)
├── admin/                # Admin CMS — React + Vite + TypeScript (SPA)
│   └── src/views/        # Login, Dashboard, per-module CRUD
├── supabase/
│   ├── migrations/       # SQL schema, RLS policies, storage bucket
│   └── seed/             # Node script to migrate old JSON content
└── README.md
```

## ⚡ Architecture

- **Backend**: [Supabase](https://supabase.com) — Postgres + Auth + Storage.
  - Public site uses the **anon key** with **RLS = read-only**.
  - Admin panel logs in via Supabase Auth (authenticated role has full CRUD).
  - Images/files upload to a public `media` storage bucket.
- **Public site**: Astro, static output. Pages fetch content **client-side** on
  load so edits appear instantly without a rebuild.
- **Admin**: React SPA, deployed under `/admin/`.
- **Fallback**: The public site bundles demo data (`src/lib/demo.ts`) so it still
  renders if Supabase isn't configured or a query fails.

## 🚀 Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project. Note the
**Project URL** and **anon public key** (Settings → API).

### 2. Apply the schema
Run the SQL in `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL
Editor. This creates all tables, enables RLS (public read / authenticated CRUD),
and creates the public `media` storage bucket.

### 3. Seed existing content (optional)
Migrate your old `prizes.json` and `blog/posts.json`:

```bash
cd admin && npm install
SUPABASE_URL="https://XXXX.supabase.co" \
SUPABASE_SERVICE_KEY="<service_role key>" \
node supabase/seed/seed.js
```

> Use the **service_role** key only for this one-time local migration.

### 4. Enable admin auth
In Supabase → Authentication → Users, **invite yourself** as a user (or create
one). Only accounts in your Supabase auth can sign in to the admin.

### 5. Configure the public site
```bash
cd site
cp .env.example .env
# edit .env → PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev      # local preview with live Supabase data
```

### 6. Configure the admin
```bash
cd admin
cp .env.example .env
# edit .env → VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev      # http://localhost:5173
```

Optional: create the admin user on the site by running the dev server and using
the Sign Up flow — but a pre-invited user is recommended so strangers can't
register.

## 🧰 Editing content
After signing into `/admin`, you get CRUD screens for:

- **Site Config** — brand, tagline, about, footer, copyright, contact, socials
- **Navigation** — order/label/link for each navbar item
- **Projects** — title, slug, tags, links, markdown body, featured, order
- **Blog Posts** — title, slug, date, excerpt, markdown body, image, published
- **Honors** — certificates/prizes with badges
- **Resources** — grouped file downloads (optional password-protect flag)
- **Skills** and **Timeline** — the chips and about-journey items

> Protected-resource passwords: the current public page treats any non-empty
> password as valid (demo). For a real password, wrap the check in a Supabase
> Edge Function and call it from the resources page.

## 🔐 Security notes
- Public site: anon key + RLS only allows `SELECT`.
- Admin: authenticated role has full CRUD; storage writes are authenticated-only.
- Never commit real keys. Copy `.env.example` files and fill them locally.

## ☁️ Deployment

### Public site (Cloudflare Pages / GitHub Pages)
Build output is `site/dist`:
```bash
cd site && npm run build
# publish site/dist
```
Set the two `PUBLIC_SUPABASE_*` build env vars in the hosting dashboard.

### Admin (any static host)
Build output is `admin/dist`:
```bash
cd admin && npm run build
# publish admin/dist under the /admin path of your site
```
Set `VITE_SUPABASE_*` build env vars.

> Tip: add a Supabase webhook (Database → Webhooks) that triggers a Pages build
> on table changes if you want fresh prerendered SEO pages on content edits.

## 📄 License
See [LICENSE](LICENSE).

---
Built with Astro + React + Supabase. Maintained by Boon.
