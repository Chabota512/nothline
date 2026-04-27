import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
};

export function Chip({ label, selected, onPress, small }: Props) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: selected ? c.foreground : c.card,
            borderColor: selected ? c.foreground : c.border,
            paddingVertical: small ? 6 : 9,
            paddingHorizontal: small ? 11 : 14,
          },
        ]}
      >
        <Text
          style={{
            color: selected ? c.background : c.foreground,
            fontFamily: "Inter_500Medium",
            fontSize: small ? 12 : 13,
            letterSpacing: 0.1,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
