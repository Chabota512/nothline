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

- **Storage**: AsyncStorage only — no backend. Keys: `@northline:blocks:v1`, `@northline:reflections:v1`, `@northline:onboarded:v1`, `@northline:settings:v1`.
- **Tabs**: Today (audit + timeline + settings gear), Reflect (day notes + gap recovery), Insights (week patterns).
- **Notifications**: `expo-notifications` schedules a repeating local TIME_INTERVAL reminder asking "What did the last X minutes hold?". Android channel `northline-reminders` with PUBLIC lockscreen visibility. Web is no-op. Configurable interval (20/30/40/60/90 min). Re-armed on app start in `SettingsContext`.
- **Onboarding**: 3-slide modal shown on first launch (welcome → capture → reminders). Last slide offers reminder enable + interval picker on native.
- **Categories**: id `drift` is preserved internally for back-compat but labeled "Leisure" in the UI; no migration needed for existing data. All categories count equally toward totals (no special drift handling).
- **Build/test**: APK builds not supported on Replit. Use Expo Go for Android testing via the QR code in the workflow logs.
