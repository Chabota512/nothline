import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { hourlyBuckets } from "@/lib/insights";
import { formatHourShort, MINUTE } from "@/lib/time";
import type { TimeBlock } from "@/lib/types";

export function HourHeatmap({ blocks }: { blocks: TimeBlock[] }) {
  const c = useColors();
  const buckets = hourlyBuckets(blocks);
  const max = Math.max(...buckets.map((b) => b.ms), 30 * MINUTE);

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View style={{ flexDirection: "row", gap: 4, alignItems: "flex-end" }}>
        {buckets.map((b) => {
          const ratio = b.ms > 0 ? Math.max(0.12, b.ms / max) : 0;
          return (
            <View
              key={b.hour}
              style={{ flex: 1, alignItems: "center", gap: 2 }}
            >
              <View
                style={{
                  width: "100%",
                  height: 64,
                  justifyContent: "flex-end",
                }}
              >
                {ratio > 0 ? (
                  <View
                    style={{
                      height: `${ratio * 100}%`,
                      backgroundColor: c.primary,
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      height: 2,
                      backgroundColor: c.border,
                    }}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {[0, 6, 12, 18, 23].map((h) => (
          <Text
            key={h}
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 10,
            }}
          >
            {formatHourShort(h)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const _styles = StyleSheet.create({});
