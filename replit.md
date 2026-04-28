# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `northline` (Expo mobile app)

Calm, neutral self-awareness time-tracking app. Time-audit-first; not judgmental.

- **Model**: Scheduled time blocks anchored to `dayStartHour` (6) → `dayEndHour` (23) at `reminderIntervalMinutes` (default 60). Each block has status `pending | logged | missed`. Free-form text — no fixed categories.
- **Storage**: AsyncStorage only — no backend. Keys: `@northline:scheduledBlocks:v1`, `@northline:reflections:v1`, `@northline:onboarded:v1`, `@northline:settings:v1`. Legacy `@northline:blocks:v1` cleared on load.
- **Tabs**: Today (Now card + timeline + Audits + Settings), Reflect (day notes + missed-block recovery), Insights (prose week patterns).
- **Audit**: full-screen `app/audit.tsx` — per-day breakdown of the current week with totals, notes, and a "where the time went" recap.
- **Notifications**: `expo-notifications` schedules a repeating local TIME_INTERVAL reminder. Tapping a notification deep-links to QuickLog for the current block via `Notifications.useLastNotificationResponse()`. Android channel `northline-reminders` with PUBLIC lockscreen visibility. Web is no-op. Re-armed on app start in `SettingsContext`.
- **Onboarding**: 3-slide modal shown on first launch (welcome → capture → reminders).
- **Suggestions**: adaptive — surface the user's own past activities as chips, ranked by recency-of-day match, only after logging on ≥2 distinct days.
- **Build/test**: APK builds not supported on Replit. Use Expo Go via QR; production APK via GitHub Actions cloud build pushed to https://github.com/Chabota512/nothline.git (typo intentional).
