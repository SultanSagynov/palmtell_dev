# PalmSight — Simplified Concept (v2)

## Core Philosophy

**One account = One palm = One destiny**

Each user can only read their own palm. Photo and birth date are locked forever after first submission. This creates trust, prevents fraud, and makes the product conceptually clear.

---

## Subscription Plans

### Basic — $0.99/month
- Palm analysis: Personality, Life Path, Career (3 core sections)
- 1 reading per month
- No horoscope features

### Pro — $4.99/month or $48/year (save 20%)
- Everything in Basic
- Relationships & Health sections unlocked
- Lucky Numbers
- Daily horoscope
- 5 readings per month

### Ultimate — $8.99/month or $86/year (save 20%)
- Everything in Pro
- Monthly horoscope forecast
- PDF export of readings
- **Unlimited readings per month**

**No free trial.** First reading requires payment.

---

## Access Matrix

| Feature | Basic $0.99 | Pro $4.99 | Ultimate $8.99 |
|---|---|---|---|
| Personality | ✓ | ✓ | ✓ |
| Life Path | ✓ | ✓ | ✓ |
| Career | ✓ | ✓ | ✓ |
| Relationships | locked | ✓ | ✓ |
| Health | locked | ✓ | ✓ |
| Lucky Numbers | locked | ✓ | ✓ |
| Daily horoscope | locked | ✓ | ✓ |
| Monthly horoscope | locked | locked | ✓ |
| PDF export | locked | locked | ✓ |
| **Readings/month** | 1 | 5 | Unlimited |

Locked sections are rendered **blurred** with upgrade CTA overlay.

---

## Database Schema

```sql
users
  id uuid PK
  clerk_id text UNIQUE
  email text UNIQUE
  name text
  palm_photo_url text          -- immutable after confirmation
  dob date                     -- immutable after confirmation
  palm_confirmed boolean       -- locks photo + dob
  created_at timestamptz

subscriptions
  id uuid PK
  user_id uuid FK users
  ls_customer_id text
  ls_subscription_id text
  ls_variant_id text
  plan text                    -- 'basic' | 'pro' | 'ultimate'
  status text                  -- 'active' | 'past_due' | 'canceled' | 'expired'
  renews_at timestamptz
  ends_at timestamptz
  created_at timestamptz

readings
  id uuid PK
  user_id uuid FK users
  image_url text               -- same as user.palm_photo_url
  analysis_json jsonb          -- full GPT-4o response
  created_at timestamptz
```

**No profiles table.** Each user has exactly one palm and one birth date.

---

## Palm Validation (Anti-Fraud)

### Two-step validation process:

**Step 1 — Client-side (MediaPipe Hands)**
- Runs in browser before upload
- Checks: "Is there a hand in the image?"
- If no hand detected → block submit, show error
- Free, instant, no API cost

**Step 2 — Server-side (GPT-4o)**
- After upload, before creating reading
- Checks:
  1. Is this a human palm (not back of hand)?
  2. Is palm facing camera?
  3. Is image clear enough to see lines?
  4. Is this a real hand (not drawing, not screen photo)?
- Returns JSON: `{ "is_valid": true/false, "reason": "..." }`
- If invalid → reject, **do NOT charge reading credit**, return error to user

**Example rejection reasons:**
- "No hand visible in image"
- "Back of hand detected, please show palm"
- "Image too blurry to analyze"
- "Appears to be a photo of screen"

**Cost:** ~$0.001 per validation (cheap model like gpt-4o-mini)

---

## User Journey

### First-time user (no account yet)

```
1. Landing page
   └─→ [Read My Palm] CTA button

2. Palm upload page (NO registration yet)
   ├─→ Camera or file upload
   ├─→ MediaPipe validates hand presence
   └─→ If no hand: "Please upload palm photo"

3. Date of birth form
   ├─→ Day / Month / Year dropdowns
   └─→ "We need this for horoscope insights"

4. Confirmation screen
   ┌─────────────────────────────────────┐
   │ Confirm Your Details                │
   │                                     │
   │ [Palm photo preview]                │
   │ Date of birth: March 15, 1990       │
   │                                     │
   │ ⚠️ Important Notice:                │
   │ • This will be YOUR palm reading    │
   │ • You cannot change these later     │
   │ • All future readings use this data │
   │                                     │
   │ [✓] I confirm this is my palm & DOB │
   │                                     │
   │ [Go Back]  [Confirm & Continue]     │
   └─────────────────────────────────────┘

5. Server validates palm (GPT-4o check)
   ├─→ If invalid: error message, go back to step 2
   └─→ If valid: continue

6. "Analyzing your palm..." (3-5 sec animation)

7. Preview result page
   ├─→ Show blurred sections
   ├─→ First 2 sentences of Personality visible
   └─→ "Subscribe to unlock full reading" CTA

8. Pricing page → Lemon Squeezy checkout

9. After payment: redirect to registration
   └─→ Clerk signup form (email + password)

10. Email verification

11. After verification:
    ├─→ Save palm_photo_url + dob to users table
    ├─→ Set palm_confirmed = true
    ├─→ Run full GPT-4o analysis
    └─→ Redirect to /dashboard/reading

12. User sees full unlocked reading
```

**Key insight:** User commits payment BEFORE creating account. This reduces drop-off — they've already paid, so they complete registration.

---

## Returning user journey

```
1. Login (Clerk)

2. Dashboard
   ├─→ Shows: last reading, subscription status
   ├─→ [New Reading] button
   │   ├─→ Checks monthly quota (Basic=1, Pro=5, Ultimate=∞)
   │   ├─→ If quota exceeded: upgrade modal
   │   └─→ If allowed: creates new reading using existing palm_photo_url
   │
   └─→ Readings history list

3. New reading process:
   ├─→ NO photo upload (uses saved palm_photo_url)
   ├─→ "Analyzing..." animation
   ├─→ GPT-4o generates fresh reading (temperature=0.3 for consistency)
   └─→ Show result (sections locked based on plan)

4. If locked section clicked:
   └─→ Upgrade modal → pricing page
```

---

## Palm & DOB Locking

### After first confirmation (`palm_confirmed = true`):

**In Profile Page:**
```
┌──────────────────────────────────────┐
│ Your Palm & Birth Chart              │
│                                      │
│ [Palm photo thumbnail]               │
│ Uploaded: February 16, 2026          │
│                                      │
│ Date of Birth: March 15, 1990        │
│ Zodiac Sign: Pisces ♓               │
│                                      │
│ 🔒 Locked                            │
│ These details cannot be changed.     │
│ All readings are based on this palm  │
│ and birth data.                      │
└──────────────────────────────────────┘
```

**Backend enforcement:**
```typescript
// In any API endpoint that might receive palm photo or DOB
if (user.palm_confirmed) {
  return res.status(403).json({
    error: "Palm and birth date are locked and cannot be changed"
  });
}
```

**Why lock?**
- Prevents users from reading other people's palms on one account
- Creates product integrity: "this is YOUR reading"
- Simplifies architecture: no multi-profile complexity
- Builds trust: readings are consistent, not gaming the system

---

## Reading Generation Flow

### When user requests new reading:

```typescript
// 1. Check subscription status
const sub = await getSubscription(userId);
if (!sub || sub.status !== 'active') {
  return { error: 'No active subscription' };
}

// 2. Check monthly quota
const plan = sub.plan; // 'basic' | 'pro' | 'ultimate'
const quotas = { basic: 1, pro: 5, ultimate: Infinity };
const readingsThisMonth = await countReadingsThisMonth(userId);

if (readingsThisMonth >= quotas[plan]) {
  return { error: 'Monthly quota exceeded', upgradeRequired: true };
}

// 3. Get user's locked palm data
const user = await prisma.user.findUnique({ where: { id: userId } });
if (!user.palm_confirmed) {
  return { error: 'Palm not confirmed' };
}

// 4. Generate reading using saved palm photo
const reading = await analyzeWithGPT4o({
  imageUrl: user.palm_photo_url,
  prompt: PALM_ANALYSIS_PROMPT,
  temperature: 0.3,  // consistency across re-reads
  seed: 42
});

// 5. Save to database
await prisma.reading.create({
  data: {
    user_id: userId,
    image_url: user.palm_photo_url,
    analysis_json: reading,
  }
});

// 6. Return result (frontend applies access gates based on plan)
return { reading, plan: sub.plan };
```

---

## Horoscope Integration

### Daily Horoscope (Pro+)
- Uses `user.dob` to calculate sun sign
- Call Aztro API (RapidAPI)
- Cache in Redis: `horoscope:daily:{sign}:{date}` (TTL: end of day)
- 1 API call per sign per day = 12 calls/day max

### Monthly Horoscope (Ultimate only)
- Uses `user.dob` for personalized forecast
- Call GPT-4o with prompt:
  ```
  Generate monthly horoscope for someone born {dob}, for {month} {year}.
  Return JSON: { love, career, energy, summary }
  ```
- Cache in Redis: `horoscope:monthly:{userId}:{YYYY-MM}` (TTL: 30 days)

---

## Payment Flow (Lemon Squeezy)

### Checkout
```typescript
// POST /api/billing/checkout
const checkout = await createCheckout(storeId, variantId, {
  checkoutData: {
    email: userEmail,
    custom: {
      user_id: userId,
      palm_photo_url: tempPhotoUrl,  // passed through checkout
      dob: tempDob
    }
  },
  productOptions: {
    redirectUrl: `${APP_URL}/auth/signup?session={checkout_id}`
  }
});
```

### After successful payment:
1. Lemon Squeezy redirects to `/auth/signup?session={checkout_id}`
2. User completes registration (Clerk)
3. Webhook `subscription_created` fires → create subscription in DB
4. After email verification → save palm data, unlock reading

---

## API Routes

```
Public (no auth):
  GET    /api/public/horoscope/:sign   SEO-friendly daily horoscope

Protected (Clerk auth required):
  POST   /api/palm/submit              First-time palm + DOB submission
  POST   /api/palm/confirm             Confirm palm after checkbox
  POST   /api/readings                 Create new reading (uses saved palm)
  GET    /api/readings                 List user's readings
  GET    /api/readings/:id             Get single reading
  GET    /api/horoscope/daily          Daily horoscope (Pro+)
  GET    /api/horoscope/monthly        Monthly forecast (Ultimate)
  POST   /api/billing/checkout         Create Lemon Squeezy checkout
  GET    /api/billing/portal           Customer portal URL
  
Webhooks (signature verification):
  POST   /api/webhooks/lemonsqueezy    Subscription events
  POST   /api/webhooks/clerk           User sync events
```

---

## Key Screens

### 1. Landing Page `/`
- Hero: "Discover Your Destiny Through Palmistry"
- How it works (3 steps)
- Pricing cards (Basic/Pro/Ultimate)
- CTA: "Read My Palm Now"
- SEO optimized, SSR

### 2. Palm Upload `/palm/upload`
- Camera/file upload UI
- MediaPipe hand detection overlay
- Progress: "Step 1 of 3"

### 3. Birth Date `/palm/birthdate`
- Simple form: day/month/year
- Progress: "Step 2 of 3"

### 4. Confirmation `/palm/confirm`
- Preview palm photo
- Show DOB
- Warning notice
- Checkbox: "I confirm this is my palm"
- Progress: "Step 3 of 3"

### 5. Preview Result `/palm/preview`
- Blurred sections
- First 2 lines of Personality visible
- "Subscribe to unlock" CTA → /pricing

### 6. Pricing `/pricing`
- 3 plan cards (Basic/Pro/Ultimate)
- Monthly/Annual toggle
- Feature comparison table
- Each card → Lemon Squeezy checkout

### 7. Dashboard `/dashboard`
- Subscription status badge
- Readings count this month (e.g. "2 of 5 used")
- [New Reading] button
- Reading history cards
- Link to profile

### 8. Reading Result `/dashboard/reading/:id`
- Animated section reveal (Framer Motion)
- Locked sections: blurred + upgrade overlay
- Share button
- PDF download (Ultimate only)

### 9. Profile `/dashboard/profile`
- User info (name, email)
- Palm photo (locked, read-only)
- Birth date (locked, read-only)
- Subscription management → Lemon Squeezy portal

---

## Email Events (Resend)

Only 2 transactional emails:

1. **Welcome email** (after email verification)
   - Subject: "Welcome to PalmSight ✋"
   - Body: "Your reading is ready" + link to dashboard
   
2. **Payment receipt** (Lemon Squeezy auto-sends)
   - Handled by Lemon Squeezy, not our code

**NO other emails:**
- No trial expiry warnings (no trial)
- No daily horoscope emails (in-app only)
- No promotional emails
- No re-engagement emails

---

## SEO Strategy

### Target pages

| URL | Keyword | Type |
|---|---|---|
| `/` | palm reading online, AI palmistry | Landing |
| `/horoscope/aries` | aries horoscope 2026 | SSG |
| `/horoscope/taurus` | taurus horoscope 2026 | SSG |
| ... (12 pages, one per sign) | ... | SSG |
| `/learn/palmistry` | what is palmistry | SSG |
| `/learn/palm-lines` | palm lines meaning | SSG |
| `/pricing` | palm reading app price | Static |

### SEO requirements
- `generateMetadata()` on every page
- JSON-LD structured data (WebApplication, FAQPage)
- Sitemap: `next-sitemap` package
- OpenGraph images for social sharing
- Canonical URLs

---

## Tech Stack (unchanged)

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon.tech)
- **ORM:** Prisma
- **Auth:** Clerk.dev
- **Storage:** Cloudflare R2
- **AI:** OpenAI GPT-4o Vision
- **Horoscope:** Aztro API (RapidAPI)
- **Payments:** Lemon Squeezy
- **Email:** Resend.com
- **Cache/Queue:** Upstash Redis + QStash
- **Hosting:** Vercel

---


## What's Different from Previous Version

### Removed:
- ❌ 7-day free trial
- ❌ Multi-profile system
- ❌ Compatibility readings (comparing two palms)
- ❌ Trial expiry emails
- ❌ Complex profile switching UI
- ❌ Separate horoscopes per profile

### Added:
- ✅ Palm + DOB locking (immutable after confirmation)
- ✅ Confirmation screen with warning
- ✅ Two-step palm validation (MediaPipe + GPT-4o)
- ✅ Payment-before-registration flow
- ✅ Lower price points ($0.99 entry)

### Simplified:
- One account = one person's data
- No trial period confusion
- Clear upgrade path (Basic → Pro → Ultimate)
- Fewer API routes
- Simpler database schema

---



## Summary

This simplified version:
- Removes complexity (no profiles, no trial)
- Adds integrity (locked palm/DOB)
- Improves UX (payment before registration = commitment)
- Lowers entry price ($0.99 vs $9.99)
- Faster to build (fewer tables, fewer routes)
- Easier to explain to users

**Core value:** "Your palm, your destiny, forever locked to your account."

## Pre-Registration Data Flow (Technical)

### Problem
User uploads palm photo and DOB **before** creating account (Clerk handles registration). How do we preserve this data through the registration process?

### Solution: Session-based temporary storage

**Step 1: Upload palm + DOB (no account yet)**
```typescript
// POST /api/palm/submit (public endpoint, no auth)

// Generate session token
const sessionToken = crypto.randomUUID();

// Upload photo to R2 with temp prefix
const tempKey = `temp/${sessionToken}/palm.jpg`;
await r2.upload(tempKey, photoFile);

// Store in Redis with 1-hour TTL
await redis.set(
  `temp_palm:${sessionToken}`,
  JSON.stringify({
    photo_key: tempKey,
    dob: req.body.dob,
    confirmed: false,
    created_at: Date.now()
  }),
  'EX', 3600  // expires in 1 hour
);

// Set session token in cookie
res.setHeader('Set-Cookie', `palm_session=${sessionToken}; HttpOnly; Secure; Path=/`);

return { sessionToken };
```

**Step 2: Confirmation screen**
```typescript
// POST /api/palm/confirm (public, but requires palm_session cookie)

const sessionToken = req.cookies.palm_session;
const tempData = await redis.get(`temp_palm:${sessionToken}`);

if (!tempData) {
  return { error: 'Session expired, please start over' };
}

// Run GPT-4o validation
const validation = await validatePalm(tempData.photo_key);
if (!validation.is_valid) {
  return { error: validation.reason };
}

// Update Redis: mark as confirmed
await redis.set(
  `temp_palm:${sessionToken}`,
  JSON.stringify({ ...tempData, confirmed: true }),
  'EX', 3600
);

return { success: true };
```

**Step 3: Payment (Lemon Squeezy)**
```typescript
// POST /api/billing/checkout (public)

const sessionToken = req.cookies.palm_session;

const checkout = await createCheckout(variantId, {
  checkoutData: {
    custom: {
      palm_session: sessionToken  // pass session token through checkout
    }
  },
  productOptions: {
    redirectUrl: `${APP_URL}/auth/signup?session=${sessionToken}`
  }
});
```

**Step 4: After payment → Registration**

User completes payment → redirected to `/auth/signup?session={token}`

Clerk signup form loads. Session token preserved in URL.

**Step 5: After Clerk registration + email verification**
```typescript
// Clerk webhook: user.updated (email verified)

// Extract session token from user metadata or from webhook custom data
const sessionToken = webhookData.data.custom?.palm_session;

if (sessionToken) {
  // Retrieve temp data from Redis
  const tempData = await redis.get(`temp_palm:${sessionToken}`);
  
  if (tempData && tempData.confirmed) {
    // Move photo from temp to permanent location
    const permanentKey = `palms/${userId}/original.jpg`;
    await r2.copy(tempData.photo_key, permanentKey);
    await r2.delete(tempData.photo_key);  // cleanup temp
    
    // Save to users table
    await prisma.user.update({
      where: { clerk_id: webhookData.data.id },
      data: {
        palm_photo_url: permanentKey,
        dob: new Date(tempData.dob),
        palm_confirmed: true
      }
    });
    
    // Cleanup Redis
    await redis.del(`temp_palm:${sessionToken}`);
    
    // Trigger full reading analysis (async job)
    await qstash.publishJSON({
      url: `${APP_URL}/api/jobs/analyze-palm`,
      body: { userId, photoKey: permanentKey }
    });
  }
}
```

### Alternative: Lemon Squeezy Custom Data

If cookies are unreliable (Safari ITP, cross-domain issues), use Lemon Squeezy's custom data field:

```typescript
// Step 1: Upload to R2, get permanent URL
const photoUrl = await uploadToR2(file);

// Step 2: Pass data through checkout
const checkout = await createCheckout(variantId, {
  checkoutData: {
    custom: {
      palm_photo_url: photoUrl,  // direct URL
      dob: '1990-03-15'
    }
  }
});

// Step 3: Webhook receives this data
// webhook.data.attributes.custom_data = { palm_photo_url, dob }
```

**Pros:** No Redis needed, survives long sessions
**Cons:** Photo URL exposed in checkout flow (less secure)

### Recommended Approach

**Use Redis + session cookies** because:
- More secure (photo not in URL params)
- Clean separation (temp vs permanent storage)
- Automatic cleanup (1-hour TTL)
- Works even if user abandons registration

**Fallback:** If session lost, user can restart from landing page. Temp photos auto-delete after 1 hour.

### Edge Cases

**User abandons after payment:**
- Payment succeeded but never verified email
- Solution: Clerk sends reminder emails automatically
- After 7 days: manual cleanup script deletes unverified users + their temp data

**User pays, registers, but different email:**
- Webhook can't match payment to user
- Solution: Store Lemon Squeezy customer email in custom data, match by email in webhook

**Session expires during registration:**
- User took >1 hour between upload and email verification
- Solution: Show error "Session expired" + button "Start Over"
- Better: Extend Redis TTL to 24 hours for paid users (check payment status)

---

## Summary

**Technical concept document — no business metrics, no timelines, pure implementation details.**

Key changes from v1:
- Removed free trial → all plans paid from day 1
- Removed profiles → one palm per account, locked forever
- Added palm validation → MediaPipe + GPT-4o two-step check
- Added confirmation screen → user explicitly confirms before locking
- Simplified pricing → $0.99 / $4.99 / $8.99

Data flow before registration solved via Redis session storage + cookies, with Lemon Squeezy custom data as fallback.

