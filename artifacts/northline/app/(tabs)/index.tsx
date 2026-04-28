import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { FloatingLogButton } from "@/components/FloatingLogButton";
import { Header } from "@/components/Header";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TimelineBlockView } from "@/components/TimelineBlockView";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import {
  formatDuration,
  formatTime,
  greeting,
  todayLabel,
} from "@/lib/time";
import type { ScheduledBlock } from "@/lib/types";

export default function TodayScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { todayBlocks, currentBlock, missedBlocks } = useBlocks();
  const [logBlock, setLogBlock] = useState<ScheduledBlock | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const now = Date.now();

  const loggedToday = useMemo(
    () => todayBlocks.filter((b) => b.status === "logged"),
    [todayBlocks],
  );
  const totalLogged = loggedToday.reduce(
    (s, b) => s + (b.endTime - b.startTime),
    0,
  );

  const openLog = (block: ScheduledBlock | null): void => {
    if (!block) return;
    setLogBlock(block);
    setLogOpen(true);
  };

  const handleFabPress = useCallback((): void => {
    // Default the FAB to the current block, or fall back to the most
    // recent missed block if there's nothing active right now.
    if (currentBlock) {
      setLogBlock(currentBlock);
      setLogOpen(true);
      return;
    }
    if (missedBlocks.length > 0) {
      setLogBlock(missedBlocks[missedBlocks.length - 1]);
      setLogOpen(true);
      return;
    }
    // Otherwise, log the next pending block.
    const next = todayBlocks.find((b) => b.status === "pending");
    if (next) {
      setLogBlock(next);
      setLogOpen(true);
    }
  }, [currentBlock, missedBlocks, todayBlocks]);

  // Phase 3: tapping a notification opens QuickLog for the current block.
  // We track the last-handled response id so the same tap doesn't re-open
  // the sheet on every re-render.
  const handledResponseRef = useRef<string | null>(null);
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (handledResponseRef.current === id) return;
    handledResponseRef.current = id;
    handleFabPress();
  }, [lastResponse, handleFabPress]);

  const topPad = isWeb ? 67 : insets.top + 8;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top-right action cluster: Audits, Settings */}
      <View
        style={{
          position: "absolute",
          top: topPad + 4,
          right: 12,
          zIndex: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => router.push("/audit")}
          hitSlop={10}
          accessibilityLabel="Audits"
          style={({ pressed }) => ({
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            Audits
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={10}
          accessibilityLabel="Settings"
          style={{ padding: 8 }}
        >
          <Feather name="settings" size={18} color={c.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header kicker={greeting(now)} title={todayLabel(now)} />

        {/* Now / current block card */}
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

          {currentBlock ? (
            <View>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 22,
                  lineHeight: 28,
                  letterSpacing: -0.4,
                }}
              >
                {formatTime(currentBlock.startTime)} —{" "}
                {formatTime(currentBlock.endTime)}
              </Text>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                {currentBlock.status === "logged"
                  ? `Logged: ${currentBlock.primaryActivity}`
                  : "What are you doing right now?"}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 22,
                lineHeight: 28,
                letterSpacing: -0.4,
              }}
            >
              Outside the day
            </Text>
          )}

          {missedBlocks.length > 0 ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 12,
                lineHeight: 19,
              }}
            >
              {missedBlocks.length}{" "}
              {missedBlocks.length === 1 ? "block" : "blocks"} unlogged. Tap
              any to fill from memory.
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <Stat
              label="Logged today"
              value={formatDuration(totalLogged)}
              color={c.foreground}
              borderColor={c.border}
            />
            <Stat
              label="Captured"
              value={`${loggedToday.length}/${todayBlocks.filter((b) => b.status !== "pending").length || 0}`}
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
              title="No blocks scheduled"
              body="Open settings to set your day's start and end and your reminder interval."
            />
          ) : (
            todayBlocks.map((b, i) => (
              <TimelineBlockView
                key={b.id}
                block={b}
                isLast={i === todayBlocks.length - 1}
                onPress={
                  b.status === "missed" || b.status === "logged" || b.id === currentBlock?.id
                    ? () => openLog(b)
                    : undefined
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <FloatingLogButton onPress={handleFabPress} />

      <QuickLogSheet
        visible={logOpen}
        block={logBlock}
        onClose={() => {
          setLogOpen(false);
          setLogBlock(null);
        }}
      />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
