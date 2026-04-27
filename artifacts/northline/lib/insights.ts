import { formatHourShort, HOUR, MINUTE, startOfWeek } from "./time";
import type { BuildCategory, TimeBlock } from "./types";

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

export function distractionMs(blocks: TimeBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    if (b.builds === "drift") total += b.endTime - b.startTime;
    if (b.secondaryActivity)
      total += Math.min(15 * MINUTE, (b.endTime - b.startTime) * 0.25);
  }
  return total;
}

export type HourBucket = {
  hour: number;
  ms: number;
  driftMs: number;
};

export function hourlyBuckets(blocks: TimeBlock[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    ms: 0,
    driftMs: 0,
  }));
  for (const b of blocks) {
    let cursor = b.startTime;
    while (cursor < b.endTime) {
      const d = new Date(cursor);
      const hour = d.getHours();
      const nextHour = new Date(d);
      nextHour.setHours(hour + 1, 0, 0, 0);
      const slice = Math.min(b.endTime, nextHour.getTime()) - cursor;
      if (b.builds === "drift") {
        buckets[hour].driftMs += slice;
      } else {
        buckets[hour].ms += slice;
      }
      cursor += slice;
    }
  }
  return buckets;
}

export function bestStretch(
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

export function generateInsights(blocks: TimeBlock[]): string[] {
  const out: string[] = [];
  const week = startOfWeek(Date.now());
  const recent = blocks.filter((b) => b.endTime >= week);

  if (recent.length < 3) {
    out.push(
      "A few more moments of capture and patterns will start to emerge.",
    );
    return out;
  }

  const bh = bestStretch(recent.filter((b) => b.builds !== "drift"));
  if (bh) {
    out.push(
      `Your strongest stretch is between ${formatHourShort(bh.start)} and ${formatHourShort(bh.end)}.`,
    );
  }

  const drift = recent.filter((b) => b.builds === "drift");
  if (drift.length) {
    const driftMs = drift.reduce((s, b) => s + (b.endTime - b.startTime), 0);
    const hours = (driftMs / HOUR).toFixed(1);
    const hourMap = new Map<number, number>();
    for (const b of drift) {
      const h = new Date(b.startTime).getHours();
      hourMap.set(h, (hourMap.get(h) ?? 0) + (b.endTime - b.startTime));
    }
    let topHour = -1;
    let topMs = 0;
    for (const [h, ms] of hourMap.entries()) {
      if (ms > topMs) {
        topMs = ms;
        topHour = h;
      }
    }
    if (topHour >= 0) {
      out.push(
        `Drift gathers around ${formatHourShort(topHour)} — about ${hours}h this week.`,
      );
    } else {
      out.push(`Drift this week: ${hours}h.`);
    }
  }

  const withSecondary = recent.filter((b) => b.secondaryActivity);
  if (withSecondary.length >= 3) {
    out.push(
      "Your focused sessions often include attention leakage. Notice the pattern.",
    );
  }

  const totals = totalsByBuild(recent);
  const positive = totals
    .filter((t) => t.category !== "drift")
    .sort((a, b) => b.ms - a.ms);
  const top = positive[0];
  if (top) {
    const labelMap: Record<BuildCategory, string> = {
      skill: "building skill",
      body: "caring for your body",
      wealth: "building toward future freedom",
      people: "tending relationships",
      mind: "restoring your mind",
      drift: "drifting",
    };
    out.push(`Most of your week went toward ${labelMap[top.category]}.`);
  }

  return out;
}

export function identityLine(blocks: TimeBlock[]): string {
  const totals = totalsByBuild(blocks).sort((a, b) => b.ms - a.ms);
  const positive = totals.filter((t) => t.category !== "drift");
  if (positive.length === 0) {
    return "Still listening.";
  }
  const top = positive[0];
  const map: Record<BuildCategory, string> = {
    skill: "Disciplined learner",
    body: "Body-aware",
    wealth: "Quiet builder",
    people: "Present with people",
    mind: "Restored",
    drift: "Drifting",
  };
  return map[top.category];
}
