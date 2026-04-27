import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FloatingLogButton } from "@/components/FloatingLogButton";
import { Header } from "@/components/Header";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TimelineBlockView } from "@/components/TimelineBlockView";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import {
  DAY,
  HOUR,
  MINUTE,
  dateKey,
  endOfDay,
  formatDuration,
  formatTime,
  greeting,
  startOfDay,
  todayLabel,
} from "@/lib/time";
import type { TimeBlock } from "@/lib/types";

export default function TodayScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { blocks, addBlock } = useBlocks();
  const [logOpen, setLogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const now = Date.now();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const todayBlocks = useMemo(
    () =>
      blocks.filter((b) => b.endTime > dayStart && b.startTime < dayEnd),
    [blocks, dayStart, dayEnd],
  );

  const lastLogged = useMemo<TimeBlock | null>(() => {
    if (blocks.length === 0) return null;
    return blocks.reduce<TimeBlock>(
      (a, b) => (a.endTime > b.endTime ? a : b),
      blocks[0],
    );
  }, [blocks]);

  const totalToday = todayBlocks.reduce(
    (s, b) => s + (b.endTime - b.startTime),
    0,
  );

  const activeDays = useMemo(() => {
    const set = new Set<string>();
    for (const b of blocks) set.add(dateKey(b.startTime));
    return set.size;
  }, [blocks]);

  const prompt = useMemo(
    () => choosePrompt({ now, lastLogged, activeDays }),
    [now, lastLogged, activeDays],
  );

  const topPad = isWeb ? 67 : insets.top + 8;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Pressable
        onPress={() => setSettingsOpen(true)}
        hitSlop={10}
        accessibilityLabel="Settings"
        style={{
          position: "absolute",
          top: topPad + 4,
          right: 18,
          zIndex: 10,
          padding: 8,
        }}
      >
        <Feather name="settings" size={18} color={c.mutedForeground} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header kicker={greeting(now)} title={todayLabel(now)} />

        {/* Audit card */}
        <View
          style={[
            styles.nowCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View style={styles.nowKicker}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: c.primary,
              }}
            />
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            >
              Now · {formatTime(now)}
            </Text>
          </View>

          <AuditHeadline
            lastLogged={lastLogged}
            now={now}
            color={c.foreground}
            mutedColor={c.mutedForeground}
          />

          {prompt ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 12,
                lineHeight: 19,
              }}
            >
              {prompt}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <Stat
              label="Logged today"
              value={formatDuration(totalToday)}
              color={c.foreground}
              borderColor={c.border}
            />
            <Stat
              label="Entries"
              value={String(todayBlocks.length)}
              color={c.foreground}
              borderColor={c.border}
            />
          </View>
        </View>

        {/* Timeline */}
        <View style={{ marginTop: 30, marginBottom: 16 }}>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              paddingHorizontal: 24,
              marginBottom: 16,
            }}
          >
            Today
          </Text>

          {todayBlocks.length === 0 ? (
            <EmptyState
              icon="sunrise"
              title="No entries yet"
              body="Log a stretch of time to begin the day's record."
            />
          ) : (
            todayBlocks.map((b, i) => (
              <TimelineBlockView
                key={b.id}
                block={b}
                isLast={i === todayBlocks.length - 1}
              />
            ))
          )}
        </View>

        {todayBlocks.length > 0 ? (
          <View
            style={{
              marginHorizontal: 24,
              marginTop: 16,
              padding: 18,
              borderRadius: 14,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.border,
              backgroundColor: c.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Feather name="moon" size={18} color={c.mutedForeground} />
            <Text
              style={{
                flex: 1,
                color: c.foreground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              When the day winds down, head to{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Reflect</Text>{" "}
              to fill any gaps and add a note.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <FloatingLogButton onPress={() => setLogOpen(true)} />

      <QuickLogSheet
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onSave={async (b) => {
          await addBlock(b);
          setLogOpen(false);
        }}
        title="Log a moment"
      />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

function AuditHeadline({
  lastLogged,
  now,
  color,
  mutedColor,
}: {
  lastLogged: TimeBlock | null;
  now: number;
  color: string;
  mutedColor: string;
}) {
  if (!lastLogged) {
    return (
      <Text
        style={{
          color,
          fontFamily: "Inter_600SemiBold",
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.4,
        }}
      >
        Nothing logged yet.
      </Text>
    );
  }

  const since = now - lastLogged.endTime;
  const sinceLabel =
    since < MINUTE
      ? "just now"
      : since < HOUR
        ? `${Math.round(since / MINUTE)} min`
        : `${formatDuration(since)}`;

  return (
    <View>
      <Text
        style={{
          color,
          fontFamily: "Inter_600SemiBold",
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.4,
        }}
      >
        {sinceLabel}
        <Text style={{ color: mutedColor }}> since last entry</Text>
      </Text>
      <Text
        style={{
          color: mutedColor,
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          marginTop: 6,
          lineHeight: 19,
        }}
      >
        {formatTime(lastLogged.endTime)} — {lastLogged.primaryActivity}
      </Text>
    </View>
  );
}

function choosePrompt({
  now,
  lastLogged,
  activeDays,
}: {
  now: number;
  lastLogged: TimeBlock | null;
  activeDays: number;
}): string | null {
  if (!lastLogged) return "Log a stretch of time to begin.";

  const since = now - lastLogged.endTime;

  if (since > 3 * HOUR) return "Where did the last few hours go?";
  if (since > HOUR) return "What's filled the time since?";
  if (since > 30 * MINUTE) return "What just happened?";

  // Recent log. After at least one full day of use, occasionally let the
  // deeper question surface — quietly, never as the headline.
  if (activeDays >= 1) {
    const dayIndex = Math.floor(now / DAY);
    if (dayIndex % 5 === 0) return "Quietly — what is this hour building?";
  }

  return null;
}

function Stat({
  label,
  value,
  color,
  borderColor,
}: {
  label: string;
  value: string;
  color: string;
  borderColor: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color,
          opacity: 0.55,
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 2,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nowCard: {
    marginHorizontal: 24,
    padding: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nowKicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});
