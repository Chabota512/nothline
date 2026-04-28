import { HOUR, MINUTE, formatHourShort, startOfWeek } from "./time";
import type { ScheduledBlock } from "./types";

export function totalLogged(blocks: ScheduledBlock[]): number {
  return blocks
    .filter((b) => b.status === "logged")
    .reduce((s, b) => s + (b.endTime - b.startTime), 0);
}

export type HourBucket = {
  hour: number;
  ms: number;
};

export function hourlyBuckets(blocks: ScheduledBlock[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    ms: 0,
  }));
  for (const b of blocks) {
    if (b.status !== "logged") continue;
    let cursor = b.startTime;
    while (cursor < b.endTime) {
      const d = new Date(cursor);
      const hour = d.getHours();
      const nextHour = new Date(d);
      nextHour.setHours(hour + 1, 0, 0, 0);
      const slice = Math.min(b.endTime, nextHour.getTime()) - cursor;
      buckets[hour].ms += slice;
      cursor += slice;
    }
  }
  return buckets;
}

export function busiestStretch(
  blocks: ScheduledBlock[],
): { start: number; end: number; ms: number } | null {
  const b = hourlyBuckets(blocks);
  let bestStart = -1;
  let bestSum = 0;
  for (let i = 0; i <= 24 - 3; i++) {
    const sum = b[i].ms + b[i + 1].ms + b[i + 2].ms;
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = i;
    }
  }
  if (bestStart < 0 || bestSum === 0) return null;
  return { start: bestStart, end: bestStart + 3, ms: bestSum };
}

export function topActivities(
  blocks: ScheduledBlock[],
  n = 5,
): { name: string; ms: number; count: number }[] {
  const map = new Map<string, { ms: number; count: number }>();
  for (const b of blocks) {
    if (b.status !== "logged") continue;
    const key = (b.primaryActivity ?? "").trim().toLowerCase();
    if (!key) continue;
    const cur = map.get(key) ?? { ms: 0, count: 0 };
    cur.ms += b.endTime - b.startTime;
    cur.count += 1;
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ms: v.ms, count: v.count }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, n);
}

export function complianceRate(blocks: ScheduledBlock[]): number {
  const past = blocks.filter(
    (b) => b.status === "logged" || b.status === "missed",
  );
  if (past.length === 0) return 0;
  const logged = past.filter((b) => b.status === "logged").length;
  return logged / past.length;
}

export function generateInsights(blocks: ScheduledBlock[]): string[] {
  const out: string[] = [];
  const week = startOfWeek(Date.now());
  const recent = blocks.filter((b) => b.endTime >= week);
  const loggedRecent = recent.filter((b) => b.status === "logged");

  if (loggedRecent.length < 3) {
    out.push("A few more entries and patterns will start to surface here.");
    return out;
  }

  const stretch = busiestStretch(loggedRecent);
  if (stretch) {
    out.push(
      `Most of your activity falls between ${formatHourShort(stretch.start)} and ${formatHourShort(stretch.end)}.`,
    );
  }

  const top = topActivities(loggedRecent, 1)[0];
  if (top) {
    out.push(
      `Your most consistent activity this week: ${top.name} (${top.count} entries).`,
    );
  }

  const withSecondary = loggedRecent.filter((b) => b.secondaryActivity);
  if (withSecondary.length >= 3) {
    out.push(
      `${withSecondary.length} of your sessions had something running in parallel.`,
    );
  }

  const rate = complianceRate(recent);
  if (rate > 0) {
    out.push(`You captured ${Math.round(rate * 100)}% of your time blocks.`);
  }

  const distinctDays = new Set(loggedRecent.map((b) => b.date)).size;
  if (distinctDays >= 3) {
    const totalH = (totalLogged(loggedRecent) / HOUR).toFixed(1);
    out.push(`${totalH}h logged across ${distinctDays} days this week.`);
  }

  return out;
}
