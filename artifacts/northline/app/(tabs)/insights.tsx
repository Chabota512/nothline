import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBar } from "@/components/CategoryBar";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { HourHeatmap } from "@/components/HourHeatmap";
import { InsightCard } from "@/components/InsightCard";
import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import {
  busiestStretch,
  generateInsights,
  topActivities,
  topCategoryLine,
  totalLogged,
  totalsByBuild,
} from "@/lib/insights";
import {
  formatDuration,
  formatHourShort,
  startOfWeek,
  weekRangeLabel,
} from "@/lib/time";

export default function InsightsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { blocks } = useBlocks();

  const weekStart = startOfWeek(Date.now());
  const weekBlocks = useMemo(
    () => blocks.filter((b) => b.endTime >= weekStart),
    [blocks, weekStart],
  );

  const totals = useMemo(() => totalsByBuild(weekBlocks), [weekBlocks]);
  const totalMs = useMemo(() => totalLogged(weekBlocks), [weekBlocks]);
  const top = useMemo(() => topActivities(weekBlocks, 5), [weekBlocks]);
  const stretch = useMemo(() => busiestStretch(weekBlocks), [weekBlocks]);
  const insights = useMemo(() => generateInsights(blocks), [blocks]);
  const topCat = useMemo(() => topCategoryLine(weekBlocks), [weekBlocks]);

  const topPad = isWeb ? 67 : insets.top + 8;

  if (weekBlocks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, paddingTop: topPad }}>
        <Header
          kicker="Insights"
          title="Patterns appear with use"
          subtitle="Log a few entries and the picture takes shape here."
        />
        <EmptyState
          icon="bar-chart-2"
          title="Nothing to read yet"
          body="Capture a handful of entries today, then return tomorrow to see the shape of your week."
        />
      </View>
    );
  }

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
          kicker={weekRangeLabel(weekStart)}
          title="This week"
          subtitle={`${formatDuration(totalMs)} captured.`}
        />

        {/* Top category card */}
        {topCat ? (
          <View
            style={[
              styles.identityCard,
              { backgroundColor: c.foreground, borderColor: c.foreground },
            ]}
          >
            <Text
              style={{
                color: c.background,
                opacity: 0.55,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Top category this week
            </Text>
            <Text
              style={{
                color: c.background,
                fontFamily: "Inter_700Bold",
                fontSize: 26,
                letterSpacing: -0.6,
                lineHeight: 32,
              }}
            >
              {topCat.label}
            </Text>
            <Text
              style={{
                color: c.background,
                opacity: 0.65,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                lineHeight: 19,
                marginTop: 6,
              }}
            >
              {formatDuration(topCat.ms)} of {formatDuration(totalMs)} tagged
              this week.
            </Text>
          </View>
        ) : null}

        {/* Categories */}
        <SectionLabel color={c.mutedForeground}>By category</SectionLabel>
        <CategoryBar rows={totals} />

        {/* Hour heatmap */}
        <SectionLabel color={c.mutedForeground} top={32}>
          Across the day
        </SectionLabel>
        {stretch ? (
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              paddingHorizontal: 24,
              marginBottom: 14,
            }}
          >
            Most of your tagged hours fall between{" "}
            <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold" }}>
              {formatHourShort(stretch.start)} — {formatHourShort(stretch.end)}
            </Text>
            .
          </Text>
        ) : null}
        <HourHeatmap blocks={weekBlocks} />

        {/* Insights */}
        {insights.length > 0 ? (
          <>
            <SectionLabel color={c.mutedForeground} top={32}>
              Notes from your week
            </SectionLabel>
            {insights.map((t, i) => (
              <InsightCard key={i} text={t} />
            ))}
          </>
        ) : null}

        {/* Top activities */}
        {top.length > 0 ? (
          <>
            <SectionLabel color={c.mutedForeground} top={24}>
              Top activities
            </SectionLabel>
            <View style={{ paddingHorizontal: 24, gap: 10 }}>
              {top.map((t) => {
                const pct = totalMs > 0 ? (t.ms / totalMs) * 100 : 0;
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
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionLabel({
  children,
  color,
  top = 24,
}: {
  children: React.ReactNode;
  color: string;
  top?: number;
}) {
  return (
    <Text
      style={{
        color,
        fontFamily: "Inter_500Medium",
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        paddingHorizontal: 24,
        marginTop: top,
        marginBottom: 14,
      }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    marginHorizontal: 24,
    padding: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 32,
  },
});
