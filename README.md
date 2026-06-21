# Foundry Row — Phase 3 (Messaging, Moderation, Analytics)

Builds on Phase 2 with three additions:
- **Messaging**: once a founder accepts an interest, both sides get a real conversation thread.
- **Admin moderation queue**: new pitches enter `PENDING_REVIEW` and only appear in the public
  ledger after an admin approves them.
- **Founder analytics**: total views, interest received, and a basic conversion rate on the
  founder dashboard.

## Stack
- Next.js 14 (App Router, API routes)
- PostgreSQL via Prisma
- Auth: bcrypt password hashing + signed JWT session cookie (no third-party auth provider)

## 1. Local setup

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to a real Postgres instance (local, Supabase, Neon, Railway...)
# generate AUTH_SECRET: openssl rand -base64 32

npx prisma db push      # creates/updates tables from prisma/schema.prisma
npm run db:seed         # optional: demo founder, investor, admin, an open pitch with a
                         # conversation already started, and one pitch sitting in the queue

npm run dev             # http://localhost:3000
```

Demo accounts after seeding (password `password123`):
- `amara@verdantlabs.dev` — founder (has one OPEN pitch, one PENDING_REVIEW pitch)
- `mariam@heliosvc.com` — investor (has an ACCEPTED interest with messages already in it)
- `admin@foundryrow.com` — admin (visit `/admin` to see the moderation queue)

## 2. Deploying (Vercel)

Same as before:
1. Push to GitHub, import into Vercel.
2. Add a Postgres database (Vercel Postgres, Neon, or Supabase) → set `DATABASE_URL`.
3. Set `AUTH_SECRET` (random string, e.g. `openssl rand -base64 32`).
4. Deploy. `npm run build` runs `prisma generate` automatically.
5. Run `npx prisma db push` once against the production `DATABASE_URL` to sync the schema
   (needed again now since the schema changed — new `Message` model, new pitch statuses,
   `viewCount` field). Re-run this any time `prisma/schema.prisma` changes.
6. Optionally seed production data the same way with `npm run db:seed`.

## 3. What's new in the code

```
app/
  admin/page.js                 moderation queue UI (admin only)
  messages/[interestId]/page.js conversation thread UI, polls every 5s
  api/
    admin/pitches/route.js          GET pending pitches (admin only)
    admin/pitches/[id]/route.js     PATCH approve (OPEN) or reject a pitch
    interests/[id]/messages/route.js GET/POST messages, only once interest is ACCEPTED
    pitches/route.js                now supports ?mine=true (founder's own pitches,
                                     any status) and only lists OPEN/IN_TALKS/CLOSED publicly
    pitches/[id]/route.js           increments viewCount on public views; hides
                                     PENDING_REVIEW/REJECTED pitches from non-owners
prisma/schema.prisma
  - Pitch.status now: PENDING_REVIEW | OPEN | IN_TALKS | CLOSED | REJECTED (new pitches
    start at PENDING_REVIEW)
  - Pitch.viewCount Int, increments on each public detail view
  - new Message model, belongs to Interest + sender (User)
```

### How moderation works
A founder's new pitch is invisible to the public ledger until an admin visits `/admin` and
clicks **Approve & publish** (sets status to `OPEN`) or **Reject**. Founders can still see their
own pending/rejected pitches on their dashboard via `GET /api/pitches?mine=true`.

### How messaging works
Messaging is gated entirely server-side: `GET`/`POST /api/interests/:id/messages` checks that the
requesting user is either the pitch's founder or the investor on that interest, *and* that the
interest's status is `ACCEPTED`. Until accepted, the route returns 403 — there's no way to message
a stranger on the platform. The UI polls every 5 seconds rather than using websockets, which is
intentionally the simplest thing that works; swap in Pusher/Ably/a websocket server if you want
real-time delivery later.

### How analytics works
`Pitch.viewCount` increments once per detail-page load — only for publicly visible pitches, so
moderation-queue peeks by the founder or admin don't inflate the count. The founder dashboard sums
this across all of a founder's pitches and divides total interests by total views for a rough
conversion rate. This is intentionally simple (no per-day breakdown, no unique-visitor dedup) —
good enough to validate the metric is useful before investing in a real analytics pipeline.

## 4. Still out of scope (candidates for Phase 4)
- No email notifications (e.g. via Resend or Postmark) when interest is sent, accepted, or a new
  message arrives — everything today is pull-based (user has to check the dashboard).
- No real-time messaging (polling only).
- No per-day/per-source view analytics, just a running total.
- No file uploads (pitch decks, logos) — would need object storage (Vercel Blob, S3).
- No rate limiting on signup/login or message sending.

## 5. Security notes
- Passwords are hashed with bcrypt, never stored or logged in plain text.
- Sessions are httpOnly, sameSite=lax JWT cookies — not readable by client JS, reducing XSS risk.
- Every mutating route re-checks the session server-side; nothing trusts a role sent from the client.
- Messaging and moderation routes independently re-verify authorization on every request — a
  founder can't message an investor who hasn't accepted, and a non-admin can never approve a pitch,
  regardless of what the client sends.
- Before any real money or equity changes hands through this platform, see the compliance note in
  the original spec doc — that still applies.

# foundry
