# Golf & Give 🏌️‍♂️❤️

> Play. Score. Win. Give Back.

A subscription-driven web application combining golf performance tracking, monthly prize draws, and charity fundraising — built for Digital Heroes' trainee selection process.

---

## Tech Stack

| Layer        | Technology                                                      |
|--------------|-----------------------------------------------------------------|
| Framework    | **Next.js 14** (App Router, Server Components, Server Actions)  |
| Styling      | **Tailwind CSS** + **shadcn/ui** (Radix primitives)             |
| State        | **Zustand** + Immer                                             |
| Forms        | **React Hook Form** + **Zod** validation                        |
| Database     | **Supabase** (PostgreSQL + RLS + Storage + Auth)                |
| Payments     | **DodoPayments** (subscriptions + webhooks)                     |
| Charts       | **Recharts**                                                    |
| Animations   | **Framer Motion** + Tailwind animate                            |
| Deployment   | **Vercel** (new project) + **Supabase** (new project)           |

---

## Project Structure

```
golf-charity-draw/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx              ← overview
│   │       ├── scores/page.tsx
│   │       ├── draws/page.tsx
│   │       ├── charity/page.tsx
│   │       ├── winners/page.tsx
│   │       └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← overview
│   │   ├── users/page.tsx
│   │   ├── draws/page.tsx
│   │   ├── charities/page.tsx
│   │   ├── winners/page.tsx
│   │   └── reports/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── payments/
│   │   │   ├── create-checkout/route.ts
│   │   │   ├── webhook/route.ts
│   │   │   ├── success/route.ts
│   │   │   └── cancel/route.ts
│   │   └── admin/
│   │       ├── draws/route.ts
│   │       └── draws/[id]/
│   │           ├── simulate/route.ts
│   │           └── publish/route.ts
│   ├── charities/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── subscribe/page.tsx
│   └── page.tsx                      ← landing
├── components/
│   ├── admin/                        ← admin UI
│   ├── dashboard/                    ← subscriber UI
│   └── shared/                       ← navbar, footer, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← browser client
│   │   └── server.ts                 ← server + admin client
│   ├── dodo/client.ts                ← DodoPayments + prize logic
│   ├── draw-engine.ts                ← draw + match algorithms
│   ├── validations.ts                ← Zod schemas
│   └── utils.ts                      ← cn, formatCurrency, etc.
├── store/index.ts                    ← Zustand global store
├── types/supabase.ts                 ← DB type definitions
├── supabase/migrations/001_initial.sql
├── middleware.ts
└── ...config files
```

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd golf-charity-draw
npm install
```

### 2. Supabase setup

1. Create a **new** Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/migrations/001_initial.sql`
3. Enable Email auth in Authentication → Providers
4. Set your site URL and redirect URLs in Auth → URL Configuration:
   - Site URL: `https://your-vercel-url.vercel.app`
   - Redirect: `https://your-vercel-url.vercel.app/api/auth/callback`

### 3. DodoPayments setup

1. Create an account at [dodopayments.com](https://dodopayments.com)
2. Create two products:
   - **Monthly** — ₹499/month recurring
   - **Yearly** — ₹4,799/year recurring
3. Copy Product IDs to `.env`
4. Set webhook endpoint to `https://your-domain/api/payments/webhook`
5. Subscribe to events: `payment.succeeded`, `subscription.cancelled`, `subscription.renewed`

### 4. Environment variables

```bash
cp .env.example .env.local
# Fill in all values from Supabase and DodoPayments dashboards
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Create a **new** Vercel account and import the repo
3. Add all environment variables from `.env.example` in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

> **Important**: Use a *new* Vercel account and *new* Supabase project as per assignment requirements.

---

## Key Features

### User Flow
- Sign up → verify email → subscribe (choose plan + charity + %) → enter scores → participate in monthly draw → upload proof if winner → receive payment

### Score System
- Stableford format, range 1–45
- One score per date (enforced via DB unique constraint)
- Rolling 5-score limit enforced by PostgreSQL trigger
- Displayed newest-first

### Draw Engine (`lib/draw-engine.ts`)
- **Random**: Standard lottery-style draw
- **Algorithmic**: Weighted toward least-frequent user scores (harder jackpot)
- Admin simulates → reviews → publishes
- 5-match jackpot rolls over automatically if unclaimed

### Prize Pool
| Tier | Share | Rollover |
|------|-------|----------|
| 5-match (Jackpot) | 40% | ✓ |
| 4-match | 35% | ✗ |
| 3-match | 25% | ✗ |

Split equally among multiple winners in same tier.

### Charity System
- User selects charity at signup (minimum 10% contribution)
- Can increase % voluntarily
- Contributions tracked per billing cycle in `charity_contributions` table

### Admin Panel
- Full user management
- Draw creation → simulation → publish workflow
- Charity CRUD
- Winner verification (approve/reject with notes)
- Analytics dashboard with Recharts

---

## Database Schema (Summary)

```
profiles          ← extends auth.users
subscriptions     ← plan, status, dodo IDs, charity %
charities         ← name, slug, media, events
golf_scores       ← user scores (rolling 5, unique per date)
draws             ← monthly draws with winning numbers
draw_entries      ← per-user draw entries + match results
winners           ← verified prize winners
charity_contributions ← per-cycle donation records
payment_events    ← webhook audit log
```

All tables have Row Level Security (RLS) enabled.

---

## Testing Checklist

- [ ] User signup & email verification
- [ ] Login / logout
- [ ] Subscription flow (monthly + yearly)
- [ ] Score entry — rolling 5, duplicate date rejected
- [ ] Edit / delete score
- [ ] Draw simulation + publish
- [ ] Winner calculation (3/4/5 match)
- [ ] Jackpot rollover (no 5-match)
- [ ] Charity selection + % update
- [ ] Winner proof upload
- [ ] Admin: approve / reject winner
- [ ] Admin: charity CRUD
- [ ] Reports charts render correctly
- [ ] Mobile responsive on all pages
- [ ] Dark mode

---

## Making an Admin

After signup, run in Supabase SQL editor:

```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

---

## License

Sample assignment — Digital Heroes trainee selection process.
