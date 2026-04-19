# Groundwork Coffee Co.

A specialty coffee and brewing gear ecommerce site built with Astro + Supabase + Stripe + Resend + Vercel.

## Stack

- **Astro 5** (server output) with Tailwind v4
- **Supabase** for products, orders, blog content, contact & subscriber data
- **Stripe Checkout** (dynamic `price_data` built from Supabase rows)
- **Resend** for order confirmations and contact emails
- **Vercel** for hosting and deployments

## Environment variables

Copy `.env.example` to `.env` and populate:

- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (whsec_…)
- `RESEND_API_KEY` — Resend API key
- `PUBLIC_SITE_URL` — Public site URL (https://…)

## Local dev

```bash
npm install --legacy-peer-deps
npm run dev
```

## What was built

- Homepage with hero, category band, featured products, philosophy, testimonials
- `/shop` jump-link catalog (coffee, gear, bundles)
- `/coffee` and `/utensils` category pages + dynamic `[slug]` product pages
- Cart (localStorage) + Stripe checkout session API + success/cancel pages
- `/about`, `/contact` (form), `/faq`, `/shipping-returns`
- `/blog` index + `/blog/[slug]` (dynamic, reads `groundwork_content` Supabase table)
- Stripe webhook handler (`checkout.session.completed`) that writes orders + sends Resend confirmation email
- Newsletter signup in footer + blog empty state
- Full programmatic SEO: per-page title/description/OG, JSON-LD schema (Organization, WebSite, Product, BlogPosting, BreadcrumbList, FAQPage, CollectionPage, AboutPage, ContactPage), sitemap.xml and robots.txt

## Supabase tables used

- `groundwork_products` — product catalog
- `groundwork_orders` — completed orders (webhook writes)
- `groundwork_content` — blog posts (dynamic, populated by Harbor Writer)
- `groundwork_contact_submissions` — contact form
- `groundwork_subscribers` — newsletter signups

## Next steps

- Connect your custom domain in Vercel dashboard
- Verify a sending domain in Resend and swap `onboarding@resend.dev` for your own
- Decide on real shipping rates in Stripe (currently relies on success/cancel redirect flow)
- Add product photography (currently using Unsplash placeholders)
