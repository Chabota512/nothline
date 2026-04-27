import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FloatingLogButton } from "@/components/FloatingLogButton";
import { Header } from "@/components/Header";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { TimelineBlockView } from "@/components/TimelineBlockView";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import {
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

  const now = Date.now();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const todayBlocks = useMemo(
    () =>
      blocks.filter((b) => b.endTime > dayStart && b.startTime < dayEnd),
    [blocks, dayStart, dayEnd],
  );

  const lastLogged = useMemo(() => {
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

  const topPad = isWeb ? 67 : insets.top + 8;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          kicker={greeting(now)}
          title={todayLabel(now)}
          subtitle="What this day builds is up to you."
        />

        {/* Now prompt */}
        <View
          style={[
            styles.nowCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
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
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 22,
              lineHeight: 28,
              letterSpacing: -0.4,
            }}
          >
            What is this hour building?
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginTop: 8,
              lineHeight: 19,
            }}
          >
            {lastLogged
              ? `Last captured ${formatTime(lastLogged.endTime)} — ${lastLogged.primaryActivity.toLowerCase()}.`
              : "Capture your first moment to begin."}
          </Text>

          <View style={styles.statsRow}>
            <Stat
              label="Logged today"
              value={formatDuration(totalToday)}
              color={c.foreground}
              borderColor={c.border}
            />
            <Stat
              label="Moments"
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
              title="The day is still open"
              body="Capture a single moment, no matter how small. Truth begins with one entry."
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
              When the day quiets, head to{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Reflect</Text>{" "}
              to fill any gaps and notice the day honestly.
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
        title="Capture a moment"
      />
    </View>
  );
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});
