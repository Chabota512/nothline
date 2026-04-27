import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function InsightCard({ text }: { text: string }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.muted,
        }}
      >
        <Feather name="eye" size={14} color={c.foreground} />
      </View>
      <Text
        style={{
          flex: 1,
          color: c.foreground,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          lineHeight: 22,
          letterSpacing: -0.1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
});
