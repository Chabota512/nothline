import type { ScheduledBlock } from "./types";

const MIN_DAYS_FOR_SUGGESTIONS = 2;

function distinctDayCount(blocks: ScheduledBlock[]): number {
  const set = new Set<string>();
  for (const b of blocks) {
    if (b.status === "logged") set.add(b.date);
  }
  return set.size;
}

function hourOf(ts: number): number {
  return new Date(ts).getHours();
}

/**
 * Adaptive activity suggestions based on the user's own history.
 * Returns nothing until the user has logged on at least
 * MIN_DAYS_FOR_SUGGESTIONS distinct days. After that, ranks past activities
 * by how often the user has done them around this time of day.
 */
export function suggestActivities(
  history: ScheduledBlock[],
  now: number,
  limit = 6,
): string[] {
  if (distinctDayCount(history) < MIN_DAYS_FOR_SUGGESTIONS) return [];

  const currentHour = hourOf(now);
  const score = new Map<string, { count: number; nearTime: number; display: string }>();

  for (const b of history) {
    if (b.status !== "logged") continue;
    const raw = (b.primaryActivity ?? "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const cur = score.get(key) ?? { count: 0, nearTime: 0, display: raw };
    cur.count += 1;
    const hourDiff = Math.min(
      Math.abs(hourOf(b.startTime) - currentHour),
      24 - Math.abs(hourOf(b.startTime) - currentHour),
    );
    if (hourDiff <= 2) cur.nearTime += 1;
    score.set(key, cur);
  }

  return Array.from(score.values())
    .sort((a, b) => b.nearTime - a.nearTime || b.count - a.count)
    .slice(0, limit)
    .map((s) => s.display);
}

export function suggestSecondary(
  history: ScheduledBlock[],
  limit = 4,
): string[] {
  if (distinctDayCount(history) < MIN_DAYS_FOR_SUGGESTIONS) return [];
  const counts = new Map<string, { count: number; display: string }>();
  for (const b of history) {
    if (b.status !== "logged") continue;
    const raw = (b.secondaryActivity ?? "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const cur = counts.get(key) ?? { count: 0, display: raw };
    cur.count += 1;
    counts.set(key, cur);
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((s) => s.display);
}
