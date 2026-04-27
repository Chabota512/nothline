import { formatHourShort, HOUR, MINUTE, startOfWeek } from "./time";
import { BUILD_CATEGORIES, type BuildCategory, type TimeBlock } from "./types";

export type CategoryTotal = {
  category: BuildCategory;
  ms: number;
};

export function totalsByBuild(blocks: TimeBlock[]): CategoryTotal[] {
  const map = new Map<BuildCategory, number>();
  for (const b of blocks) {
    if (!b.builds) continue;
    map.set(b.builds, (map.get(b.builds) ?? 0) + (b.endTime - b.startTime));
  }
  return Array.from(map.entries()).map(([category, ms]) => ({ category, ms }));
}

export function totalLogged(blocks: TimeBlock[]): number {
  return blocks.reduce((s, b) => s + (b.endTime - b.startTime), 0);
}

export type HourBucket = {
  hour: number;
  ms: number;
};

export function hourlyBuckets(blocks: TimeBlock[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    ms: 0,
  }));
  for (const b of blocks) {
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
  blocks: TimeBlock[],
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
  blocks: TimeBlock[],
  n = 5,
): { name: string; ms: number }[] {
  const map = new Map<string, number>();
  for (const b of blocks) {
    const key = b.primaryActivity.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + (b.endTime - b.startTime));
  }
  return Array.from(map.entries())
    .map(([name, ms]) => ({ name, ms }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, n);
}

export function findGaps(
  blocks: TimeBlock[],
  dayStart: number,
  dayEnd: number,
  minGapMs = 30 * MINUTE,
): { start: number; end: number }[] {
  const sorted = [...blocks]
    .filter((b) => b.endTime > dayStart && b.startTime < dayEnd)
    .sort((a, b) => a.startTime - b.startTime);
  const wakeStart = dayStart + 7 * HOUR;
  const lastEnd = Math.min(Date.now(), dayEnd);
  if (sorted.length === 0) {
    if (lastEnd - wakeStart >= minGapMs)
      return [{ start: wakeStart, end: lastEnd }];
    return [];
  }
  const gaps: { start: number; end: number }[] = [];
  let cursor = Math.max(wakeStart, dayStart);
  for (const b of sorted) {
    if (b.startTime - cursor >= minGapMs)
      gaps.push({ start: cursor, end: b.startTime });
    cursor = Math.max(cursor, b.endTime);
  }
  if (lastEnd - cursor >= minGapMs)
    gaps.push({ start: cursor, end: lastEnd });
  return gaps;
}

function categoryLabel(cat: BuildCategory): string {
  return BUILD_CATEGORIES.find((c) => c.id === cat)?.label ?? cat;
}

export function generateInsights(blocks: TimeBlock[]): string[] {
  const out: string[] = [];
  const week = startOfWeek(Date.now());
  const recent = blocks.filter((b) => b.endTime >= week);

  if (recent.length < 3) {
    out.push("A few more entries and patterns will start to surface here.");
    return out;
  }

  const stretch = busiestStretch(recent);
  if (stretch) {
    out.push(
      `Most of your tagged hours fall between ${formatHourShort(stretch.start)} and ${formatHourShort(stretch.end)}.`,
    );
  }

  const totals = totalsByBuild(recent).sort((a, b) => b.ms - a.ms);
  const top = totals[0];
  if (top) {
    const hours = (top.ms / HOUR).toFixed(1);
    out.push(`Most-tagged this week: ${categoryLabel(top.category)} (${hours}h).`);
  }

  const withSecondary = recent.filter((b) => b.secondaryActivity);
  if (withSecondary.length >= 3) {
    out.push(
      `${withSecondary.length} of your sessions had something running in parallel.`,
    );
  }

  const distinctDays = new Set(
    recent.map((b) => new Date(b.startTime).toDateString()),
  ).size;
  if (distinctDays >= 3) {
    const totalH = (totalLogged(recent) / HOUR).toFixed(1);
    out.push(`${totalH}h logged across ${distinctDays} days this week.`);
  }

  return out;
}

export function topCategoryLine(blocks: TimeBlock[]): {
  label: string;
  ms: number;
} | null {
  const totals = totalsByBuild(blocks).sort((a, b) => b.ms - a.ms);
  if (totals.length === 0) return null;
  const top = totals[0];
  return { label: categoryLabel(top.category), ms: top.ms };
}
