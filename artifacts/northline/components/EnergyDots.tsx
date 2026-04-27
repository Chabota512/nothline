import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  value?: number;
  onChange?: (v: number) => void;
  size?: number;
  showLabel?: boolean;
};

export function EnergyDots({
  value,
  onChange,
  size = 16,
  showLabel = true,
}: Props) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {showLabel ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            marginRight: 4,
          }}
        >
          Energy
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange?.(n)} hitSlop={6}>
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor:
                  value && n <= value ? c.primary : "transparent",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: value && n <= value ? c.primary : c.border,
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
