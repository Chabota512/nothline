import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatDuration, formatTime } from "@/lib/time";

export function GapItem({
  start,
  end,
  onPress,
}: {
  start: number;
  end: number;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: c.card,
            borderColor: c.border,
          },
        ]}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.muted,
          }}
        >
          <Feather name="circle" size={14} color={c.mutedForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
            }}
          >
            {formatTime(start)} — {formatTime(end)}
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {formatDuration(end - start)} unaccounted
          </Text>
        </View>
        <Feather name="plus" size={18} color={c.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
