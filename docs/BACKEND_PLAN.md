# Backend Plan — Minimal Netlify + Supabase for Math2

This document summarizes where to hook a small Netlify Functions backend into the existing codebase, which frontend modules currently hold the single source of truth for user/coins/progress, and how tasks/units are modeled (so the battle system can reuse them).

Chosen approach (minimal, Netlify-first)
- Netlify Functions (serverless JS/TS) for API endpoints.
- Authentication via Netlify Identity (frontend) — pass JWT in `Authorization: Bearer <token>` to functions.
- Database: Supabase (Postgres) for users, progress, messages, battles. Use simple SQL schema placed in `docs/supabase_schema.sql`.

Why Supabase
- Row-Level Security + JWT integration is convenient.
- Familiar relational model (users, progress, messages, battles).

Where to integrate (frontend references)
- Current auth & single-user store:
  - `services/apiService.ts` — `AuthService` and `DataService` use `localStorage` keys `mm_current_user` and `mm_users`. This is the current single-source-of-truth in the app.
    - Files: `services/apiService.ts` and `src/services/apiService.ts` (there are two) — these provide `AuthService.getCurrentUser()` and `DataService.updateUser()`.
  - Replace / augment `AuthService.login` and `AuthService.getCurrentUser` to call `/api/me` and persist returned profile locally. On app start, call `/api/me` to bootstrap user state instead of pure localStorage.

- Coin & progress flows to rewire:
  - `services/questService.ts` — contains logic that adjusts coins (`applyQuestCoinsDelta`, `awardCoinsForQuestion`, `completeBountyQuest`, `startBountyAttempt`, `adjustCoinsForQuest`). Currently calls `DataService.updateUser()` which writes localStorage. These server-side coin changes must be migrated to call API endpoints:
    - `POST /api/coins/adjust` for atomic coin changes and guard checks (server authoritative).
    - `POST /api/progress/save` for unit-level progress / bounty payouts / quest caps.

- Chat UI:
  - `App.tsx` contains `ChatView` (Klassen-Chat) calling `SocialService.getChatMessages()` and `SocialService.sendMessage()` implemented in `services/apiService.ts` (localStorage-backed).
  - Hook `ChatView` to `/api/chat/send` and `/api/chat/poll` (poll every 2–5s).

- Tasks & unit model:
  - `services/taskFactory.ts` and `types.ts` define `Task`, `LearningUnit`, `TaskFactory.getTasksForUnit(unitId, type)` — use these on the frontend to render tasks. For MathBattle the backend only needs to store the `unitId` + `taskId` chosen by challenger (or request a deterministic task id from the frontend and pass it to the function).

Minimal API endpoints (Netlify Functions)
- Auth:
  - GET `/api/me` — verify Identity JWT, upsert user in DB, return user profile (coins + progress summary).

- Progress:
  - POST `/api/progress/save` — body { unitId, questCoinsEarned, questCompletedCount, bountyCompleted } — upsert progress table row; return updated progress.
  - GET `/api/progress/get?unitId=...` — fetch user progress.

- Coins:
  - POST `/api/coins/adjust` — body { delta, reason, unitId?, battleId? } — server validates and applies delta atomically (no negative balance); returns updated balance.

- Chat:
  - POST `/api/chat/send` — { channelId, text } → insert message; returns created message.
  - GET `/api/chat/poll?channelId=...&since=timestamp` — returns messages newer than since.

- Battles:
  - POST `/api/battle/create` — { opponentId, stake, unitId } → verify challenger balance, deduct/reserve stake, create battle with deterministic `taskId` (choose from TaskFactory on frontend or server-side pool).
  - POST `/api/battle/accept` — { battleId } → verify opponent, check balance, deduct, set status=running.
  - POST `/api/battle/submit` — { battleId, answerPayload, solveTimeMs } → store submission; once both submitted, determine winner and payout (atomic transaction).
  - GET `/api/battle/list` — list battles for the user (open/running/finished).

Frontend integration plan (minimal changes)
- Add `src/lib/api.ts` wrapper:
  - Attaches Netlify Identity token to `Authorization` header.
  - Small helpers: `api.get('/api/me')`, `api.post('/api/coins/adjust', {...})`, etc.

- Replace direct `DataService.updateUser()` coin changes with calls to backend:
  - Example: in `QuestService.adjustCoinsForQuest` → call `POST /api/coins/adjust` and use returned user/balance to `setUser(...)`.
  - For progress completion flows (`completeBountyQuest`, `completeStandardQuest`) call `/api/progress/save` and `/api/coins/adjust` as needed.

- Chat:
  - In `App.tsx` ChatView, replace `SocialService.sendMessage` / `getChatMessages` with `api.post('/api/chat/send')` and `api.get('/api/chat/poll')`.
  - Keep polling interval (2–5s) as implemented.

- MathBattle UI (minimal):
  - New "Battles" tab or modal (use existing `LeaderboardView`/challenge flow in `App.tsx`).
  - On challenge: call `/api/battle/create`. On accept: call `/api/battle/accept`. On submit: call `/api/battle/submit`.
  - Show battle states from `/api/battle/list`.

Data model notes (mapping to Supabase)
- users (id uuid pk, display_name, coins int default 0, created_at)
- progress (user_id, unit_id, quest_coins_earned, quest_completed_count, bounty_completed, updated_at) — PK: (user_id, unit_id)
- messages (id uuid, channel_id, sender_id, text, created_at) — index (channel_id, created_at)
- battles (id uuid, challenger_id, opponent_id, unit_id, task_id, stake int, status text, created_at, accepted_at, finished_at, winner_id, result_reason)
- battle_turns (id uuid, battle_id, player_id, turn_index, submitted_at, answer_payload jsonb, is_correct bool, solve_time_ms int)

Immediate next steps (what I'll implement first)
1. Add `docs/supabase_schema.sql` with SQL for above tables (small SQL file).
2. Add minimal Netlify Functions skeleton and implement `/api/me` (verify token, upsert users).
3. Implement `POST /api/chat/send` & `GET /api/chat/poll` (simple messages table).

References (code locations)
- Chat UI & integration: `App.tsx` ChatView (search for `ChatView`, `SocialService.getChatMessages`, `SocialService.sendMessage`).
- Local auth & persisted user: `services/apiService.ts` (localStorage), `src/services/apiService.ts`.
- Coin/quest logic: `services/questService.ts`.
- Task pool & task IDs: `services/taskFactory.ts` and `types.ts`.

Notes / Assumptions
- The current app uses client-side localStorage for all state — this will be migrated incrementally. Initial rollout can keep localStorage as a cache but must always reconcile with server on `/api/me`.
- For MathBattle deterministic task selection: frontend can call `/api/battle/create` with a `taskId` it generated from `TaskFactory.getTasksForUnit(unitId, 'standard'|'bounty')` to avoid server-side randomization.
- Security: all coin adjustments and stake reservations must run server-side and use DB transactions or conditional updates to avoid races.

Files to commit in repo (deliverable list)
- `netlify/functions/*` — functions for me/progress/coins/chat/battle
- `src/lib/api.ts` — small fetch wrapper with token injection
- `docs/supabase_schema.sql`
- `docs/BACKEND_PLAN.md` (this file)
- small UI changes in `App.tsx` to call `api` for chat + battles (non-invasive)

If you want, I'll now:
- add `docs/supabase_schema.sql` and the Netlify Functions skeleton implementing `/api/me`, or
- start with chat endpoints and wire `App.tsx` ChatView to the new API.


