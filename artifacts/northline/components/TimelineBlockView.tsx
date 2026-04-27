import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatDuration, formatTime } from "@/lib/time";
import { BUILD_CATEGORIES, type TimeBlock } from "@/lib/types";

import { BuildIcon } from "./BuildIcon";

export function TimelineBlockView({
  block,
  onPress,
  isLast,
}: {
  block: TimeBlock;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const c = useColors();
  const meta = block.builds
    ? BUILD_CATEGORIES.find((b) => b.id === block.builds)
    : null;
  const isDrift = block.builds === "drift";

  return (
    <Pressable onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.timeCol}>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
            }}
          >
            {formatTime(block.startTime)}
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {formatDuration(block.endTime - block.startTime)}
          </Text>
        </View>

        <View style={styles.spine}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: isDrift ? c.mutedForeground : c.primary,
                borderColor: c.background,
              },
            ]}
          />
          {!isLast ? (
            <View style={[styles.line, { backgroundColor: c.border }]} />
          ) : null}
        </View>

        <View
          style={[
            styles.cardCol,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              lineHeight: 21,
            }}
          >
            {block.primaryActivity}
          </Text>

          {block.secondaryActivity ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 5,
                lineHeight: 17,
              }}
            >
              + {block.secondaryActivity}{" "}
              <Text style={{ fontStyle: "italic" }}>(attention leakage)</Text>
            </Text>
          ) : null}

          {meta || block.energy || block.isReconstructed ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {meta ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <BuildIcon
                    category={meta.id}
                    color={c.mutedForeground}
                    size={12}
                  />
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {meta.label}
                  </Text>
                </View>
              ) : null}
              {block.energy ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <View
                      key={n}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor:
                          n <= (block.energy ?? 0) ? c.primary : c.border,
                      }}
                    />
                  ))}
                </View>
              ) : null}
              {block.isReconstructed ? (
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    fontStyle: "italic",
                  }}
                >
                  reconstructed
                </Text>
              ) : null}
            </View>
          ) : null}

          {block.note ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 10,
                lineHeight: 19,
              }}
            >
              {block.note}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  timeCol: {
    width: 64,
    paddingTop: 16,
  },
  spine: {
    width: 22,
    alignItems: "center",
    paddingTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    zIndex: 1,
  },
  line: {
    position: "absolute",
    top: 18,
    bottom: -16,
    width: 1,
  },
  cardCol: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
