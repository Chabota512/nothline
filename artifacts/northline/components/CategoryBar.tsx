import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatDuration } from "@/lib/time";
import { BUILD_CATEGORIES, type BuildCategory } from "@/lib/types";

import { BuildIcon } from "./BuildIcon";

type Row = { category: BuildCategory; ms: number };

export function CategoryBar({ rows }: { rows: Row[] }) {
  const c = useColors();
  const positive = rows.filter((r) => r.category !== "drift");
  const drift = rows.find((r) => r.category === "drift");
  const totalPositive = positive.reduce((s, r) => s + r.ms, 0);

  if (positive.length === 0 && !drift) {
    return (
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          paddingHorizontal: 24,
        }}
      >
        Tag what your hours built and the picture takes shape here.
      </Text>
    );
  }

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {totalPositive > 0 ? (
        <View
          style={{
            flexDirection: "row",
            height: 10,
            borderRadius: 5,
            overflow: "hidden",
            backgroundColor: c.muted,
            marginBottom: 14,
          }}
        >
          {positive
            .sort((a, b) => b.ms - a.ms)
            .map((r) => {
              const pct = r.ms / totalPositive;
              return (
                <View
                  key={r.category}
                  style={{
                    flex: pct,
                    backgroundColor: barColor(r.category, c.primary),
                  }}
                />
              );
            })}
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {[...positive, ...(drift ? [drift] : [])]
          .sort((a, b) => b.ms - a.ms)
          .map((r) => {
            const meta = BUILD_CATEGORIES.find((b) => b.id === r.category);
            const pct =
              r.category === "drift"
                ? 0
                : totalPositive > 0
                  ? (r.ms / totalPositive) * 100
                  : 0;
            return (
              <View key={r.category} style={styles.row}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: c.muted,
                  }}
                >
                  <BuildIcon
                    category={r.category}
                    color={
                      r.category === "drift"
                        ? c.mutedForeground
                        : c.foreground
                    }
                    size={13}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: c.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  {meta?.label}
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginRight: 10,
                  }}
                >
                  {r.category === "drift"
                    ? "drift"
                    : `${Math.round(pct)}%`}
                </Text>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {formatDuration(r.ms)}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
}

function barColor(cat: BuildCategory, accent: string): string {
  const map: Record<BuildCategory, string> = {
    skill: accent,
    body: "#7B9E89",
    wealth: "#A78145",
    people: "#B26C5C",
    mind: "#6F7A8E",
    drift: "#8A8275",
  };
  return map[cat];
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
