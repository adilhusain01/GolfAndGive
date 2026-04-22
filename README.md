# Golf & Give

Golf & Give is a subscription product that combines golf score tracking, monthly prize draws, and recurring charity contributions. Members subscribe, select a charity, retain their latest five Stableford scores, enter monthly draws, and upload proof if they win. Admins manage draws, charities, users, payouts, and reporting from a separate console.

## What is implemented

### Public site

- Landing page with redesigned public marketing surface
- Charity directory and charity detail pages
- Public subscribe page
- Public one-time donation flow on charity pages
- Auth pages for sign up and login

### Subscriber product

- Email auth with Supabase
- Subscription checkout with Dodo Payments
- Charity selection and charity percentage preferences
- Score entry, edit, and delete
- Rolling latest-5 score lifecycle
- Draw history
- Subscription settings and cancellation request flow
- Winner proof upload flow through a server route
- Avatar upload through a server route

### Admin product

- Admin overview dashboard
- User management
  - edit profile details and role
  - edit latest subscription record
  - add, edit, delete retained scores
- Charity CRUD
- Draw creation, simulation, and publish workflow
- Winner review and payout approval or rejection
- Reports and analytics with charts

### Payments, webhooks, and notifications

- Dodo subscription checkout
- Dodo one-time donation checkout
- Webhook verification using Standard Webhooks headers
- Webhook processing for subscription activation, renewal, updates, cancellation, and payment success
- Charity contribution booking from successful payments
- Donation receipt handling
- Optional email notifications via Resend for:
  - subscription activation, renewal, cancellation
  - draw result emails
  - winner review emails
  - donation receipts

## Current architecture

### Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives in `components/ui`
- Supabase
  - Postgres
  - Auth
  - RLS
  - Storage
- Dodo Payments
- React Hook Form + Zod
- Recharts
- Sonner

### Important app areas

```text
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (dashboard)/dashboard/
    page.tsx
    charity/page.tsx
    draws/page.tsx
    settings/page.tsx
    winners/page.tsx
  admin/
    page.tsx
    users/page.tsx
    draws/page.tsx
    charities/page.tsx
    winners/page.tsx
    reports/page.tsx
  api/
    auth/callback/route.ts
    payments/
      create-checkout/route.ts
      success/route.ts
      cancel/route.ts
      webhook/route.ts
    donations/create-checkout/route.ts
    subscription/preferences/route.ts
    profile/avatar/route.ts
    winners/[id]/proof/route.ts
    admin/
      charities/route.ts
      charities/[id]/route.ts
      draws/route.ts
      draws/[id]/simulate/route.ts
      draws/[id]/publish/route.ts
      users/[id]/route.ts
      users/[id]/subscription/route.ts
      users/[id]/scores/route.ts
      users/[id]/scores/[scoreId]/route.ts
      winners/[id]/review/route.ts

lib/
  admin.ts
  dodo/client.ts
  dodo/server.ts
  draw-engine.ts
  notifications.ts
  supabase/client.ts
  supabase/server.ts
  utils.ts
  validations.ts

supabase/
  001_initial.sql
  002_permissions_patch.sql
  003_donations_patch.sql
```

## Environment variables

Copy `.env.example` to `.env.local` for local development and set the same values in Vercel for deployment.

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Dodo Payments

- `DODO_API_KEY`
- `DODO_PAYMENTS_API_KEY`
  - optional compatibility alias
  - the server supports either name
- `DODO_ENVIRONMENT`
  - `test_mode` or `live_mode`
- `DODO_WEBHOOK_SECRET`
- `DODO_PAYMENTS_WEBHOOK_KEY`
  - optional compatibility alias for the webhook secret
- `DODO_MONTHLY_PRODUCT_ID`
- `DODO_YEARLY_PRODUCT_ID`
- `DODO_DONATION_PRODUCT_ID`

### App

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

### Email

- `RESEND_API_KEY`
- `EMAIL_FROM`

### Auth

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Local development

### 1. Install

```bash
npm install
```

### 2. Initialize Supabase

For a fresh Supabase project:

1. Create a Supabase project.
2. Run `supabase/001_initial.sql` in the SQL editor.
3. Enable email auth.
4. Configure Auth URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/api/auth/callback`

For an existing project that already has partial schema/data:

- do not rerun `001_initial.sql` blindly
- apply only the relevant patch files instead:
  - `supabase/002_permissions_patch.sql`
  - `supabase/003_donations_patch.sql`

### 3. Configure Dodo

Create these products in the same Dodo environment as your API key:

- monthly recurring product
- yearly recurring product
- one-time donation product

Set the webhook endpoint to:

```text
https://your-domain/api/payments/webhook
```

Subscribe Dodo to the events used by the app:

- `payment.succeeded`
- `subscription.active`
- `subscription.renewed`
- `subscription.updated`
- `subscription.cancelled`

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deployment

### Vercel

1. Import the repo into Vercel.
2. Add all required environment variables.
3. Redeploy after any env changes.

### Supabase production setup

1. Run `001_initial.sql` for a fresh production project.
2. If production was already initialized before the later fixes, also run:
   - `002_permissions_patch.sql`
   - `003_donations_patch.sql`

### Dodo production notes

- `DODO_API_KEY`, `DODO_ENVIRONMENT`, and the product IDs must all belong to the same Dodo environment.
- Webhook verification uses Standard Webhooks headers.
- The server now keeps Dodo SDK usage in `lib/dodo/server.ts`, so client bundles do not try to read secret env vars.

## Database summary

Main tables:

- `profiles`
- `subscriptions`
- `charities`
- `golf_scores`
- `draws`
- `draw_entries`
- `winners`
- `charity_contributions`
- `payment_events`
- `donations`

Main lifecycle rules:

- one score per user per date
- rolling five-score retention
- draw publication only includes users with all five retained scores
- subscriptions are activated and updated from webhook events
- winner proof uploads go through authenticated server routes
- charity preference updates go through authenticated server routes

## Useful scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Admin setup

Create an admin after signup:

```sql
update profiles
set role = 'admin'
where email = 'your@email.com';
```
