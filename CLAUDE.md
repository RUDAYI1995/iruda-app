# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules Claude must always follow

- Always address the user as **갓루다님** in every response in this project.
- Never run a Vercel deployment (`vercel`, `vercel --prod`, etc.) unless the user explicitly asks for it in that turn (e.g. "배포해줘") — finishing or editing code is never by itself a reason to deploy.
- Never run `git push` (to GitHub) unless the user explicitly asks for it in that turn (e.g. "깃허브에 올려줘") — finishing a feature, committing locally, or a previous turn's push request is never by itself a reason to push again. Local `git commit` without pushing is fine.

## Commands

```bash
npm run dev              # start dev server (Turbopack) on port 3000
npm run build             # production build
npm run lint               # eslint
npm run seed               # reset DB and load demo data (prisma/seed.ts)
npx prisma db push          # sync prisma/schema.prisma -> dev.db (SQLite), regenerates client
npx prisma studio            # browse/edit local DB in a GUI
```

There is no test suite. Verify changes by running `npm run dev` and exercising the flow in a browser, or with `curl` against the API routes.

When `npx prisma db push` fails with an `EPERM ... query_engine-windows.dll.node` error, the dev server has the file locked — stop it first, then run `npx prisma generate` (or `db push` again), then restart the dev server.

## Architecture

Next.js App Router project (`src/app`). Auth, matching, and AI logic all live under `src/lib/*` and are called from route handlers under `src/app/api/*`; pages are otherwise server components that call `prisma` directly and pass data to small client components for interactivity.

**Auth**: NextAuth v5 (`src/auth.ts`), Credentials provider (email/password, bcrypt), JWT sessions. `src/middleware.ts` gates specific route prefixes (see its `matcher`) by redirecting unauthenticated requests to `/login` — add new protected routes there, not with ad-hoc checks in pages. Pages still call `auth()` themselves for user-specific data/redirects (e.g. `redirect("/login")` if no session), since the middleware only covers the listed prefixes.

**Database**: Prisma + local SQLite (`dev.db`) for now. `DATABASE_URL` in `.env` points at the file; the schema is intentionally Postgres-compatible so it can move to Supabase/Neon later (see PRD.md) by swapping the datasource and re-running `db push` — no SQLite-specific features are used. SQLite can't store native arrays/enums-as-lists, so anything list-shaped (`interests`, `languages`, `anxietyTriggers`) is stored as a JSON-encoded string column and must be `JSON.parse`/`JSON.stringify`'d at the boundary — see `src/app/api/test/submit/route.ts` for the pattern.

**Personality matching** (`src/lib/matching/`):
- `scoring.ts` computes the 4-axis (E/I, S/N, T/F, J/P) personality code from quiz answers — a custom model, not licensed MBTI (see PRD.md for why).
- `meetup.ts` scores compatibility between two `MatchableProfile`s: weighted blend of axis similarity, interest similarity, pace, and language overlap. Interest similarity blends Jaccard overlap with Upstage embedding cosine similarity when both profiles have an `interestEmbedding` (falls back to pure Jaccard otherwise — always handle the null case, don't assume the embedding exists).
- Meetup join (`api/meetups/[id]/join`) enforces the broad-category filter first, then requires the group score to clear `MIN_GROUP_SCORE` before allowing the join.

**Ready Room** (`api/meetups/[id]/ready/*`): a `ReadyRoom`/`ReadyRoomParticipant` state machine (`WAITING → READY_CHECK → CONFIRMED/EXPIRED`) — `start` creates/resets the room with a 30s `expiresAt`, `ok` marks the caller ready, `status` (polled every 2s by the client) lazily flips the room to `CONFIRMED`/`EXPIRED` based on whether all participants are ready or the timer has lapsed. There's no push/websocket layer — all realtime-feeling UI here is short-interval polling.

**Upstage AI** (`src/lib/upstage/client.ts`): thin wrapper around `chat/completions` and `solar/embeddings`. Every call path (personality explanation, icebreaker suggestions, embedding-at-test-submit) must degrade gracefully when `UPSTAGE_API_KEY` is unset or the call fails — these are enhancements, not blockers, so wrap in try/catch and let the primary action (saving a profile, joining a meetup) succeed regardless.

**External API integrations** follow the same "optional enhancement, needs a user-supplied key" shape as Upstage: `src/lib/transit/tago.ts` calls the 국토교통부 TAGO bus API and requires `TAGO_API_KEY`. Neither key can be provisioned by an agent — they require the human to sign up at the provider's console and paste the key into `.env`. `requireApiKey()`-style guards throw a Korean-language error naming exactly where to get the key; keep that pattern for any new external API.

**Homepage** (`src/app/page.tsx`): a single large file that inlines the feature catalog (`FEATURE_GROUPS`) driving the category sections, the hourglass category picker, and search. Landing-page decorative pieces (hourglass, cloud/plane animations, hero landscape, search ticker) are split into `src/components/*` and are largely presentational — most keyframes they use live in `src/app/globals.css` rather than Tailwind's default set.

**Route status**: many feature areas are UI-only stubs — anything the homepage links to under `/coming-soon/[slug]` is intentionally unimplemented (see the `PAGES` map in that route for what's stubbed vs. real). Don't assume a route works just because it's linked from the homepage.

## Product context

`이루다/PRD.md` and `이루다/최종계획.txt` (one directory up from this app) are the living product spec — feature scope, matching algorithm formulas, data model rationale, and what's explicitly out of scope for now. Check them before assuming a feature request is new or before "completing" something that was deliberately left as a stub.
