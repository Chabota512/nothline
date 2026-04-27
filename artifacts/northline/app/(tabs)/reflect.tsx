import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { GapItem } from "@/components/GapItem";
import { Header } from "@/components/Header";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { ReflectionSheet } from "@/components/ReflectionSheet";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import { findGaps } from "@/lib/insights";
import { dateKey, endOfDay, startOfDay, todayLabel } from "@/lib/time";

export default function ReflectScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { blocks, addBlock, addReflection, reflectionForDate } = useBlocks();

  const now = Date.now();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const today = dateKey(now);
  const reflection = reflectionForDate(today);

  const gaps = useMemo(
    () => findGaps(blocks, dayStart, dayEnd),
    [blocks, dayStart, dayEnd],
  );

  const [logOpen, setLogOpen] = useState(false);
  const [logRange, setLogRange] = useState<{ start: number; end: number } | null>(null);
  const [reflectOpen, setReflectOpen] = useState(false);

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
          title="Honest, not heavy"
          subtitle={todayLabel(now)}
        />

        {/* Reflection summary or prompt */}
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
                <Feather name="moon" size={14} color={c.primary} />
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                  }}
                >
                  Evening reflection
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
                    label="Stole time"
                    value={reflection.stoleTime}
                    color={c.foreground}
                    muted={c.mutedForeground}
                  />
                ) : null}
                {reflection.worked ? (
                  <ReflectLine
                    label="Worked"
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
                Pause for a minute. What stole your time? What worked?
              </Text>
            )}
          </View>
        </Pressable>

        {/* Gap recovery */}
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
              Gaps to remember
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
              }}
            >
              {gaps.length} {gaps.length === 1 ? "gap" : "gaps"}
            </Text>
          </View>

          {gaps.length === 0 ? (
            <EmptyState
              icon="check"
              title="The day is accounted for"
              body="No gaps thirty minutes or longer. Quietly impressive."
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
                Tap a gap to fill it. Memory is fragile — capture roughly, no need to be perfect.
              </Text>
              {gaps.map((g) => (
                <GapItem
                  key={`${g.start}-${g.end}`}
                  start={g.start}
                  end={g.end}
                  onPress={() => {
                    setLogRange({ start: g.start, end: g.end });
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
        initialStart={logRange?.start}
        initialEnd={logRange?.end}
        isReconstructed
        title="Reconstruct this stretch"
        onClose={() => {
          setLogOpen(false);
          setLogRange(null);
        }}
        onSave={async (b) => {
          await addBlock(b);
          setLogOpen(false);
          setLogRange(null);
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
