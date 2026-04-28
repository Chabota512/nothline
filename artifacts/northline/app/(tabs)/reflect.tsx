import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { ReflectionSheet } from "@/components/ReflectionSheet";
import { TimelineBlockView } from "@/components/TimelineBlockView";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import { dateKey, todayLabel } from "@/lib/time";
import type { ScheduledBlock } from "@/lib/types";

export default function ReflectScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const {
    todayBlocks,
    missedBlocks,
    addReflection,
    reflectionForDate,
  } = useBlocks();

  const now = Date.now();
  const today = dateKey(now);
  const reflection = reflectionForDate(today);

  const [logBlock, setLogBlock] = useState<ScheduledBlock | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [reflectOpen, setReflectOpen] = useState(false);

  const loggedToday = useMemo(
    () => todayBlocks.filter((b) => b.status === "logged"),
    [todayBlocks],
  );

  const topPad = isWeb ? 67 : insets.top + 8;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: 80 + (isWeb ? 100 : insets.bottom + 70),
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          kicker="Reflect"
          title="Close out the day"
          subtitle={todayLabel(now)}
        />

        {/* Day notes */}
        <Pressable onPress={() => setReflectOpen(true)}>
          <View
            style={[
              styles.reflectCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Feather name="edit-3" size={14} color={c.primary} />
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                  }}
                >
                  Day notes
                </Text>
              </View>
              <Feather
                name={reflection ? "edit-2" : "chevron-right"}
                size={16}
                color={c.mutedForeground}
              />
            </View>

            {reflection ? (
              <View style={{ gap: 10, marginTop: 4 }}>
                {reflection.stoleTime ? (
                  <ReflectLine
                    label="Notes"
                    value={reflection.stoleTime}
                    color={c.foreground}
                    muted={c.mutedForeground}
                  />
                ) : null}
                {reflection.worked ? (
                  <ReflectLine
                    label="Worth keeping"
                    value={reflection.worked}
                    color={c.foreground}
                    muted={c.mutedForeground}
                  />
                ) : null}
                {reflection.energy ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 11,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                      }}
                    >
                      Energy
                    </Text>
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <View
                          key={n}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor:
                              n <= (reflection.energy ?? 0)
                                ? c.primary
                                : c.border,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  lineHeight: 23,
                  marginTop: 4,
                }}
              >
                Anything you want to note about today?
              </Text>
            )}
          </View>
        </Pressable>

        {/* Missed blocks */}
        <View style={{ marginTop: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Missed blocks
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
              }}
            >
              {missedBlocks.length}{" "}
              {missedBlocks.length === 1 ? "block" : "blocks"}
            </Text>
          </View>

          {missedBlocks.length === 0 ? (
            <EmptyState
              icon="check"
              title="The day is fully captured"
              body={`${loggedToday.length} of your blocks have been logged.`}
            />
          ) : (
            <>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  paddingHorizontal: 24,
                  marginBottom: 14,
                  lineHeight: 19,
                }}
              >
                Tap a block to fill it. A rough estimate is fine — memory
                fades fast.
              </Text>
              {missedBlocks.map((b, i) => (
                <TimelineBlockView
                  key={b.id}
                  block={b}
                  isLast={i === missedBlocks.length - 1}
                  onPress={() => {
                    setLogBlock(b);
                    setLogOpen(true);
                  }}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <QuickLogSheet
        visible={logOpen}
        block={logBlock}
        onClose={() => {
          setLogOpen(false);
          setLogBlock(null);
        }}
      />

      <ReflectionSheet
        visible={reflectOpen}
        date={today}
        initial={reflection}
        onClose={() => setReflectOpen(false)}
        onSave={async (r) => {
          await addReflection(r);
          setReflectOpen(false);
        }}
      />
    </View>
  );
}

function ReflectLine({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  muted: string;
}) {
  return (
    <View>
      <Text
        style={{
          color: muted,
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginBottom: 3,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color,
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reflectCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
