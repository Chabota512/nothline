import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import { topActivities, totalLogged } from "@/lib/insights";
import {
  DAY,
  dateKey,
  formatDuration,
  formatTime,
  startOfDay,
  startOfWeek,
  weekRangeLabel,
} from "@/lib/time";
import type { ScheduledBlock } from "@/lib/types";

type DayBucket = {
  date: string;
  label: string;
  ts: number;
  blocks: ScheduledBlock[];
  totalMs: number;
};

function bucketByDay(
  blocks: ScheduledBlock[],
  weekStart: number,
): DayBucket[] {
  const days: DayBucket[] = [];
  for (let i = 0; i < 7; i++) {
    const ts = weekStart + i * DAY;
    const key = dateKey(ts);
    const dayBlocks = blocks
      .filter((b) => b.date === key && b.status === "logged")
      .sort((a, b) => a.startTime - b.startTime);
    const totalMs = dayBlocks.reduce(
      (s, b) => s + (b.endTime - b.startTime),
      0,
    );
    const label = new Date(ts).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    days.push({ date: key, label, ts, blocks: dayBlocks, totalMs });
  }
  return days;
}

export default function AuditScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { allLoggedBlocks } = useBlocks();

  const weekStart = startOfWeek(Date.now());
  const todayStart = startOfDay(Date.now());

  const weekBlocks = useMemo(
    () => allLoggedBlocks.filter((b) => b.endTime >= weekStart),
    [allLoggedBlocks, weekStart],
  );

  const days = useMemo(
    () => bucketByDay(weekBlocks, weekStart),
    [weekBlocks, weekStart],
  );

  const weekTotal = useMemo(() => totalLogged(weekBlocks), [weekBlocks]);
  const top = useMemo(() => topActivities(weekBlocks, 5), [weekBlocks]);

  const topPad = isWeb ? 67 : insets.top + 8;
  const hasAnything = weekBlocks.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header bar with back button */}
      <View
        style={{
          paddingTop: topPad,
          paddingHorizontal: 12,
          paddingBottom: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <Feather name="chevron-left" size={22} color={c.foreground} />
        </Pressable>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Weekly Audit
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 80 + (isWeb ? 60 : insets.bottom + 40),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 18 }}>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {weekRangeLabel(weekStart)}
          </Text>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 26,
              lineHeight: 32,
              letterSpacing: -0.6,
            }}
          >
            What did the week look like?
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              lineHeight: 21,
              marginTop: 8,
            }}
          >
            {hasAnything
              ? `${formatDuration(weekTotal)} captured across the week.`
              : "Nothing logged yet this week."}
          </Text>
        </View>

        {!hasAnything ? (
          <EmptyState
            icon="clipboard"
            title="Nothing to audit yet"
            body="Log a few blocks today and the audit will fill in as the week unfolds."
          />
        ) : null}

        {/* Per-day breakdown */}
        {hasAnything ? (
          <>
            {days.map((d) => {
              const isFuture = d.ts > todayStart;
              const isToday = d.ts === todayStart;
              const empty = d.blocks.length === 0;
              return (
                <View
                  key={d.date}
                  style={{
                    paddingHorizontal: 24,
                    marginBottom: 18,
                    opacity: isFuture ? 0.35 : 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: c.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        letterSpacing: -0.2,
                      }}
                    >
                      {d.label}
                      {isToday ? "  ·  Today" : ""}
                    </Text>
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                      }}
                    >
                      {empty ? "—" : formatDuration(d.totalMs)}
                    </Text>
                  </View>

                  {empty ? (
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_400Regular",
                        fontSize: 13,
                        opacity: 0.7,
                        fontStyle: "italic",
                      }}
                    >
                      {isFuture ? "Not yet" : "Nothing logged"}
                    </Text>
                  ) : (
                    <View
                      style={[
                        styles.dayCard,
                        { backgroundColor: c.card, borderColor: c.border },
                      ]}
                    >
                      {d.blocks.map((b, i) => (
                        <View
                          key={b.id}
                          style={{
                            flexDirection: "row",
                            paddingVertical: 8,
                            borderTopWidth:
                              i === 0 ? 0 : StyleSheet.hairlineWidth,
                            borderTopColor: c.border,
                          }}
                        >
                          <Text
                            style={{
                              color: c.mutedForeground,
                              fontFamily: "Inter_500Medium",
                              fontSize: 12,
                              width: 78,
                            }}
                          >
                            {formatTime(b.startTime)}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: c.foreground,
                                fontFamily: "Inter_500Medium",
                                fontSize: 14,
                                lineHeight: 20,
                              }}
                              numberOfLines={2}
                            >
                              {b.primaryActivity}
                            </Text>
                            {b.secondaryActivity ? (
                              <Text
                                style={{
                                  color: c.mutedForeground,
                                  fontFamily: "Inter_400Regular",
                                  fontSize: 12,
                                  marginTop: 2,
                                }}
                                numberOfLines={1}
                              >
                                + {b.secondaryActivity}
                              </Text>
                            ) : null}
                            {b.note ? (
                              <Text
                                style={{
                                  color: c.mutedForeground,
                                  fontFamily: "Inter_400Regular",
                                  fontSize: 12,
                                  marginTop: 4,
                                  fontStyle: "italic",
                                  lineHeight: 17,
                                }}
                                numberOfLines={3}
                              >
                                "{b.note}"
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Top activities recap */}
            {top.length > 0 ? (
              <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Where the time went
                </Text>
                <View style={{ gap: 10 }}>
                  {top.map((t) => {
                    const pct =
                      weekTotal > 0 ? (t.ms / weekTotal) * 100 : 0;
                    return (
                      <View key={t.name}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: c.foreground,
                              fontFamily: "Inter_500Medium",
                              fontSize: 14,
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {t.name}
                          </Text>
                          <Text
                            style={{
                              color: c.mutedForeground,
                              fontFamily: "Inter_400Regular",
                              fontSize: 12,
                              marginLeft: 8,
                            }}
                          >
                            {formatDuration(t.ms)}
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: c.muted,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              width: `${pct}%`,
                              height: 4,
                              backgroundColor: c.primary,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
