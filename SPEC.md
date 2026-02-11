# Palmtell — Technical Specification (LLM-ready)

## Product
B2C SaaS web app. Users upload palm photo → AI analysis → personality, life insights, career advice. Optional horoscope by birth date for retention.

**Monetization model: Reverse Trial.**
First reading is fully unlocked for 7 days at no cost. No credit card required to start. After day 7, all sections except the 3 basic ones lock. Upgrade to Pro or Ultimate to restore full access and unlock additional readings.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router, SSR for SEO) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend | Next.js API Routes (monorepo) |
| Database | PostgreSQL via Neon.tech (serverless) |
| ORM | Prisma |
| Auth | Clerk.dev (managed) — handles registration, email verify, password reset, sessions |
| File storage | Cloudflare R2 (palm photo uploads, no egress fees) |
| AI — palm analysis | OpenAI GPT-4o Vision API (image + prompt → JSON) |
| AI — horoscope | Aztro API (RapidAPI) for daily; LLM call for personalized monthly |
| Payments | Stripe (Checkout + Subscriptions + Customer Portal + Webhooks) |
| Email | Resend.com (transactional: welcome, trial expiry warning, receipts) |
| Job queue | Upstash QStash or BullMQ+Upstash Redis (async AI processing) |
| CDN | Cloudflare |
| Hosting | Vercel (frontend + API routes) |
| Monitoring | Sentry + PostHog |

---

## Database Schema

```sql
users
  id uuid PK
  clerk_id text UNIQUE
  email text UNIQUE
  name text
  trial_started_at  timestamptz  -- set on first reading, null until then
  trial_expires_at  timestamptz  -- trial_started_at + 7 days
  created_at timestamptz

profiles
  id uuid PK
  user_id uuid FK users         -- billing owner
  name text                     -- "Me", "Anna", "Mom"
  dob date                      -- drives horoscope, lucky numbers, natal chart
  is_default boolean            -- first profile, cannot be deleted
  avatar_emoji text             -- optional e.g. "🌸"
  created_at timestamptz

subscriptions
  id uuid PK
  user_id uuid FK users
  stripe_customer_id text
  stripe_subscription_id text
  plan text                     -- 'pro' | 'ultimate'
  status text                   -- 'trialing'|'active'|'past_due'|'canceled'|'expired'
  current_period_end timestamptz

readings
  id uuid PK
  user_id uuid FK users         -- for billing & quota tracking
  profile_id uuid FK profiles   -- whose palm & DOB to use for personalized features
  image_url text
  analysis_json jsonb
  created_at timestamptz

horoscopes
  id uuid PK
  profile_id uuid FK profiles   -- per-profile, not per-user
  date date
  sign text
  content_json jsonb
  generated_at timestamptz
```

---

## Auth (Clerk.dev)

Clerk handles everything — no custom auth code needed:
- Email/password registration
- Email verification (mandatory before access)
- Password reset via email
- Session management (JWT)
- Middleware: `clerkMiddleware()` in Next.js to protect routes

Protected routes: `/dashboard/*`, `/api/*` (except `/api/webhooks/stripe`, `/api/public/*`)

After Clerk registration webhook fires → create `users` row in DB.

---

## Palm Reading Pipeline

1. **Client:** MediaPipe Hands (JS, in-browser) pre-validates a hand is present before upload — blocks submission if no hand detected, no API call made
2. **Client:** User uploads JPG/PNG/WEBP/HEIC ≤10MB, preview with crop tool (`react-image-crop`)
3. **API `/api/readings` POST:** upload image to Cloudflare R2 → get private URL
4. **Job queue:** enqueue analysis job (return `reading_id` to client immediately)
5. **Worker — validation:** GPT-4o first checks if image contains a palm (see prompt below). If `no_palm_detected` → mark job failed, do NOT deduct reading credit, return error to client
6. **Worker — analysis:** if palm confirmed → run full analysis prompt → save `analysis_json` to `readings` table
7. **Client:** poll `GET /api/readings/:id` or SSE for status → render result on completion

**Reading credit is only deducted after successful palm validation (step 5 passes).**

### GPT-4o Vision Prompts

**Step 1 — Validation prompt (cheap, fast, gpt-4o-mini ok):**
```
Look at this image. Does it contain a human palm facing the camera?
Return ONLY one of: {"valid": true} or {"error": "no_palm_detected"}
```

**Step 2 — Analysis prompt (only runs if step 1 valid):**
```
You are an expert palmist with 30 years of experience.
Carefully analyze the palm lines, mounts, finger shape, and hand structure in the image.
Return ONLY valid JSON with this exact structure — no text outside the JSON:
{
  "personality": { "summary": "string", "traits": ["string"] },
  "life_path": { "summary": "string", "lines": { "life": "string", "head": "string", "heart": "string" } },
  "career": { "summary": "string", "fields": ["string"], "strengths": ["string"] },
  "relationships": { "summary": "string" },
  "health": { "summary": "string" },
  "lucky": { "numbers": [int], "symbol": "string" }
}
```

**API call format:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  temperature: 0.3,   // low temperature for consistency across re-reads
  seed: 42,           // OpenAI reproducibility seed
  messages: [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: signedR2Url, detail: "high" } },
      { type: "text", text: "Analyze this palm." }
    ]
  }],
  response_format: { type: "json_object" },
  max_tokens: 1500
});
```

### Consistency Across Re-reads ("Living Palm" narrative)

Using `temperature: 0.3` + `seed: 42` keeps results stable across multiple reads of the same palm. Minor variations are reframed as a product feature — not a bug:

UI copy: *"Your palm lines evolve over time. Each reading captures a unique moment in your journey."*

Reading history shows a timeline: "Reading — Jan 2026 · Reading — Feb 2026" so users perceive differences as personal growth, not inconsistency.

### Reading Subject — Multi-Profile Model ("Profiles")

**Core concept:** One account can have multiple named Profiles (personas), each with their own name, DOB, reading history, and horoscope. A reading is always assigned to a specific Profile — not to the account. Billing/limits are tracked at the account level.

**Why this matters:** If a Pro user photographs their wife's palm, all personalized features (horoscope, Lucky Numbers, natal chart, Compatibility) must be generated from the wife's DOB — not the account owner's. The Profiles model solves this cleanly and also becomes a monetization lever (Free = 1 profile only).

**Example account structure:**
```
Account: ivan@mail.com  (Pro plan, 10 readings/month pool)
├── Profile "Me" (Ivan)  DOB: 15.03.1990  [default]
│   ├── Reading Jan 2026
│   └── Daily horoscope based on Ivan's DOB
├── Profile "Anna" (wife)  DOB: 22.07.1992
│   ├── Reading Feb 2026
│   └── Daily horoscope based on Anna's DOB
└── Profile "Mom"  DOB: 05.11.1965
    └── Reading Feb 2026
```

**Profile limits by plan:**

| | Free | Pro $9.99/mo | Ultimate $19.99/mo |
|---|---|---|---|
| Profiles per account | 1 (self only) | 3 | Unlimited |
| Readings/month (shared pool) | 1 | 10 | Unlimited |
| Compatibility reading (2 profiles) | — | ✓ | ✓ |
| Natal chart per profile | — | — | ✓ |

**Compatibility reading** = compare two profiles' palm analyses + DOBs → generate relationship/compatibility report. Strong viral mechanic (couples, friends, family). Available from Pro.

**UX flow — new reading:**
```
[New Reading] →
  "For whom?" 
  → [Me (Ivan)] [Anna ♥] [Mom] [+ Add Profile]
  → (if Free tier & tries to add) → Upgrade modal: "Upgrade to Pro to read for others"
  → Profile selected → Palm photo → Analysis
  → All sections (horoscope, lucky numbers, etc.) use selected profile's DOB
```

**DB changes:**
```sql
-- New table
profiles
  id uuid PK
  user_id uuid FK users   -- billing owner
  name text               -- "Me", "Anna", "Mom"
  dob date                -- used for horoscope, lucky numbers, natal chart
  is_default boolean      -- first profile = default (cannot be deleted)
  avatar_emoji text       -- optional fun UI element e.g. "🌸"
  created_at timestamptz

-- readings: replace subject_name/subject_dob with profile_id
readings
  id uuid PK
  user_id uuid FK users   -- for billing & monthly quota
  profile_id uuid FK profiles  -- whose palm & whose DOB to use
  image_url text
  analysis_json jsonb
  created_at timestamptz

-- horoscopes: per profile, not per user
horoscopes
  id uuid PK
  profile_id uuid FK profiles
  date date
  sign text
  content_json jsonb
  generated_at timestamptz
```

**Profile count gate:**
```typescript
// Before creating a new profile
const profileCount = await db.profiles.count({ where: { user_id } });
const limits = { free: 1, pro: 3, ultimate: Infinity };
if (profileCount >= limits[subscription.plan]) {
  return 403; // show upgrade modal
}
```


## Subscription Plans & Stripe

### Access model

| | Trial (day 0–7) | After day 7 (no sub) | Pro $9.99/mo | Ultimate $19.99/mo |
|---|---|---|---|---|
| Personality | ✓ | ✓ | ✓ | ✓ |
| Life Path | ✓ | ✓ | ✓ | ✓ |
| Career | ✓ | ✓ | ✓ | ✓ |
| Relationships | ✓ | locked | ✓ | ✓ |
| Health | ✓ | locked | ✓ | ✓ |
| Lucky Numbers | ✓ | locked | ✓ | ✓ |
| Detailed line overlay | ✓ | locked | locked | ✓ |
| Natal chart | ✓ | locked | locked | ✓ |
| Horoscope (in-app) | ✓ | locked | ✓ | ✓ |
| Additional readings | — | — | 10/mo | Unlimited |
| Extra profiles | — | 1 only | 3 | Unlimited |
| Compatibility reading | ✓ | locked | ✓ | ✓ |
| PDF export | ✓ | locked | ✓ | ✓ |

Annual billing: 20% discount (Pro = $95.90/yr, Ultimate = $191.90/yr).

**Trial expiry logic:**
```typescript
// users table
trial_started_at timestamptz   // set on first reading submission
trial_expires_at timestamptz   // = trial_started_at + 7 days

// Access check helper
function getAccessTier(user, subscription) {
  const now = new Date();
  if (subscription?.status === 'active') return subscription.plan; // 'pro' | 'ultimate'
  if (user.trial_expires_at && now < user.trial_expires_at) return 'trial';
  return 'expired'; // 3 basic sections only
}
```

Locked sections rendered blurred with upgrade CTA overlay. Full `analysis_json` always stored — gating is render-time only.

### Stripe Integration

- **Checkout:** `POST /api/billing/checkout` → create Stripe Checkout Session → redirect
- **Portal:** `GET /api/billing/portal` → Stripe Customer Portal URL (plan change, cancel, update card)
- **Webhooks** `POST /api/webhooks/stripe` (no auth, verify Stripe-Signature header):
  - `customer.subscription.created/updated` → upsert `subscriptions` row
  - `customer.subscription.deleted` → set status `canceled`
  - `invoice.payment_failed` → set status `past_due`

### Plan transitions

**Upgrade (any → Pro/Ultimate):** immediate effect. Stripe proration auto-calculated.

**Downgrade (Ultimate → Pro):** takes effect at end of current billing period. Store `pending_plan` on subscription. Show in UI: *"Your plan will change to Pro on March 1."*

**Cancellation:** access continues until `current_period_end`. After that webhook fires → status `expired` → user drops to 3 basic sections. Extra profiles become read-only (history visible, no new readings). Banner: *"You have 2 saved profiles. Upgrade to Pro to add new readings for them."*

---

## Horoscope Module

Activated when `dob` is set on a profile. Viewable in-app only — no automated emails sent.

- **Daily:** call Aztro API (RapidAPI) with sun sign → cache per sign per day in Redis (1 API call/sign/day max)
- **Monthly (Pro+):** LLM call with birth date + current month → personalized forecast JSON, cached per profile per month
- **Natal chart (Ultimate):** Prokerala API or similar → birth chart data, generated once and stored

**Notifications rule:** notifications (email + push) are only sent to the account owner's email for transactional events. Horoscope data for additional profiles is viewable in-app only — no emails are sent for non-default profiles, ever.

---

## API Routes

```
POST   /api/readings              submit new reading (auth required, body: { profile_id, image })
GET    /api/readings              list readings for user (optionally filter by profile_id)
GET    /api/readings/:id          get single reading
POST   /api/readings/compatibility  compare two profiles (body: { profile_id_a, profile_id_b }) Pro+
GET    /api/profiles              list user's profiles
POST   /api/profiles              create new profile (checks plan limit)
PUT    /api/profiles/:id          update profile (name, dob, emoji)
DELETE /api/profiles/:id          delete non-default profile
GET    /api/horoscope/daily       daily horoscope for a profile (?profile_id=)
GET    /api/horoscope/monthly     monthly forecast Pro+ (?profile_id=)
POST   /api/billing/checkout      create Stripe checkout session
GET    /api/billing/portal        Stripe portal URL
POST   /api/webhooks/stripe       Stripe webhook
POST   /api/webhooks/clerk        Clerk user sync → create default profile on registration
GET    /api/public/horoscope/:sign  public daily (no auth, for SEO)
```

---

## Access Gate Logic

```typescript
// On reading submission — set trial start if first ever reading
if (!user.trial_started_at) {
  await db.users.update({
    where: { id: user.id },
    data: {
      trial_started_at: new Date(),
      trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
}

// On any protected route — determine access tier
function getAccessTier(user, subscription) {
  const now = new Date();
  if (subscription?.status === 'active') return subscription.plan; // 'pro' | 'ultimate'
  if (user.trial_expires_at && now < new Date(user.trial_expires_at)) return 'trial';
  return 'expired';
}

// Reading quota check
const tier = getAccessTier(user, sub);
if (tier === 'expired') return 402;          // show upgrade modal
if (tier === 'trial') {
  const count = await db.readings.count({ where: { user_id: user.id } });
  if (count >= 1) return 402;               // trial = 1 reading only
}
if (tier === 'pro') {
  const count = await db.readings.count({
    where: { user_id: user.id, created_at: { gte: startOfMonth() } }
  });
  if (count >= 10) return 429;             // Pro quota exceeded
}
// ultimate = unlimited
```

### DB additions for trial
```sql
users
  + trial_started_at  timestamptz   -- set on first reading submission, null until then
  + trial_expires_at  timestamptz   -- trial_started_at + 7 days
```

---

## Onboarding Funnel (Reverse Trial)

```
Landing page
  → [Try Free — Read My Palm] button
  → Palm photo upload (NO registration required)
  → Client-side MediaPipe validation (hand detected?)
  → "Analyzing your palm..." animation (3–5 sec)
  → Preview screen: first 2 lines of Personality visible, rest blurred
  → "Create a free account to unlock your full reading"
  → Registration form (name, email, password)
  → Email verification (Clerk handles)
  → EMAIL 1 sent: "Welcome — your reading is ready" (see Email Rules)
  → Full reading unlocked — all sections visible
  → 7-day trial starts (trial_started_at = now)
  → Days 1–6: zero emails, zero notifications
  → Day 6: EMAIL 2 sent: "Tomorrow your full access changes"
  → Day 7+: sections lock, upgrade modal shown on next visit
```

**Key UX detail:** palm photo is saved in server-side session during registration flow. After email verification, the reading is processed automatically — user lands directly on their result. They never have to upload again.

---

## Email Rules

**Total emails during trial period: 2. No exceptions.**

| Trigger | Email | Content |
|---|---|---|
| Email verified | Welcome email | "Your reading is ready" + link to dashboard |
| Day 6 of trial | Expiry warning | "Tomorrow some features will be locked — upgrade to keep full access" |
| Subscription activated | Receipt | Stripe-generated receipt (automatic) |
| Payment failed | Dunning | Stripe-generated (automatic, 1 email) |
| Subscription canceled | Confirmation | "Access continues until [date]" |

**What is NEVER sent:**
- Daily horoscope emails (in-app only)
- Promotional emails during trial
- Emails about other profiles (Anna, Mom, etc.) — account owner's email only, always
- Re-engagement emails (not in MVP scope)

---



- Next.js `generateMetadata()` on every page (title, description, og:image)
- JSON-LD: `WebApplication` on homepage, `FAQPage` on landing, `BreadcrumbList` on blog
- `next-sitemap` package for XML sitemap
- `robots.txt`: disallow `/dashboard`, `/api`
- Public pages must be static (SSG) or SSR — never client-only render

### Key Public Pages (SEO targets)

| URL | Target keyword |
|---|---|
| `/` | palm reading AI, online palmistry |
| `/learn/palmistry` | what is palmistry |
| `/learn/palm-lines` | palm lines meaning |
| `/horoscope/[sign]` | [sign] horoscope 2025 |
| `/free-reading` | free palm reading online |
| `/blog/[slug]` | long-tail palmistry keywords |
| `/pricing` | palm reading app |

---

## UI/UX Notes

- Dark-mode first. Colors: primary `#5B4FCF`, accent `#F59B0B`, bg-dark `#0F0E1A`
- Fonts: Inter (UI) + Playfair Display (reading headings)
- Reading reveal: Framer Motion stagger animation per section
- Locked sections: blurred content + upgrade CTA overlay (not hidden, just visually locked)
- Mobile-first. PWA manifest for installability
- Camera capture: `getUserMedia` → canvas preview → upload

---

## Environment Variables Needed

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=                     # Neon.tech postgres URL

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# AI
OPENAI_API_KEY=                   # GPT-4o Vision for palm analysis + horoscope LLM

# Horoscope
RAPIDAPI_KEY=                     # for Aztro daily horoscope

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_ULTIMATE_PRICE_ID=
STRIPE_ULTIMATE_ANNUAL_PRICE_ID=

# Email
RESEND_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Free Tier Strategy — What to Use at Launch

На старте (0–200 юзеров) можно работать почти бесплатно:

| Service | Free Tier | Когда переходить на платное |
|---|---|---|
| **Neon.tech** (Postgres) | 0.5 GB storage, 1 compute unit — хватит на тысячи юзеров | При > ~5,000 активных юзеров |
| **Vercel** (хостинг) | Hobby plan бесплатно, 100 GB bandwidth | Когда нужны team-фичи или > 100 GB/мес |
| **Cloudflare R2** (хранилище фото) | 10 GB/мес бесплатно | ~10k фото по 1 MB = 10 GB. Переходи при росте |
| **Upstash Redis** | 10,000 команд/день бесплатно | Хватит на кэш гороскопов и rate limiting на старте |
| **Resend** (email) | 3,000 писем/мес бесплатно | Хватит до ~1,000 активных юзеров с daily digest |
| **Clerk.dev** (auth) | Free до 10,000 MAU | Долго не упрёшься |
| **Sentry** (мониторинг) | 5,000 ошибок/мес бесплатно | Хватит на MVP |
| **Aztro API** (гороскопы) | Free tier на RapidAPI | Кэшируй результаты в Redis (1 запрос/знак/день) |
| **PostHog** (аналитика) | 1M событий/мес бесплатно | Очень долго не упрёшься |

**Что точно НЕ бесплатно с первого дня:**
- **OpenAI GPT-4o Vision** — ~$0.01–0.03 за анализ (платишь за токены). При 100 анализах/мес = $1–3. Это ОК.
- **Stripe** — 2.9% + $0.30 с каждой транзакции. Платишь только когда зарабатываешь.

**Вывод:** реальные затраты на инфраструктуру до первых ~500 юзеров — это только OpenAI API и Stripe комиссия. Всё остальное укладывается в free tiers.

---

## Disclaimer (must appear on every reading)

> Palmtell readings are generated by AI for entertainment purposes only. Not medical, psychological, financial, or legal advice.

---

## Legal Pages Required
- Terms of Service
- Privacy Policy (GDPR + CCPA)
- Cookie Policy (consent banner)
- Refund Policy
