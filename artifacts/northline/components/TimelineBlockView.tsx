import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatTime } from "@/lib/time";
import type { ScheduledBlock } from "@/lib/types";

type Props = {
  block: ScheduledBlock;
  isLast?: boolean;
  onPress?: () => void;
};

export function TimelineBlockView({ block, isLast, onPress }: Props) {
  const c = useColors();

  const isLogged = block.status === "logged";
  const isMissed = block.status === "missed";
  const isPending = block.status === "pending";

  const dotColor = isLogged
    ? c.primary
    : isMissed
      ? c.mutedForeground
      : c.border;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={styles.row}>
        <View style={styles.timeCol}>
          <Text
            style={{
              color: isPending ? c.mutedForeground : c.foreground,
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
            {formatTime(block.endTime)}
          </Text>
        </View>

        <View style={styles.spine}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                borderColor: c.background,
                ...(isMissed
                  ? {
                      backgroundColor: "transparent",
                      borderColor: c.mutedForeground,
                    }
                  : {}),
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
            {
              backgroundColor: c.card,
              borderColor: c.border,
              opacity: isPending ? 0.55 : 1,
            },
          ]}
        >
          {isLogged && block.primaryActivity ? (
            <>
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
                  + {block.secondaryActivity}
                </Text>
              ) : null}

              {block.energy ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 10,
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
            </>
          ) : isMissed ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                Missed
              </Text>
              {onPress ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: c.primary,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      letterSpacing: 0.4,
                    }}
                  >
                    FILL
                  </Text>
                  <Feather name="chevron-right" size={14} color={c.primary} />
                </View>
              ) : null}
            </View>
          ) : (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              Upcoming
            </Text>
          )}
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
