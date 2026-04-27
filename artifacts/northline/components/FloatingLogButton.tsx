import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  onPress: () => void;
  label?: string;
};

export function FloatingLogButton({ onPress, label = "Log a moment" }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  // Tab bar internal height ~64-84, plus inset, plus floating margin.
  const bottom = (isWeb ? 84 : 64 + insets.bottom) + 16;

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { justifyContent: "flex-end" }]}
    >
      <View
        style={{
          alignItems: "center",
          paddingBottom: bottom,
        }}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {},
              );
            }
            onPress();
          }}
          accessibilityLabel={label}
          style={({ pressed }) => ({
            backgroundColor: c.foreground,
            paddingHorizontal: 22,
            paddingVertical: 14,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            opacity: pressed ? 0.85 : 1,
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          })}
        >
          <Feather name="plus" size={18} color={c.background} />
          <Text
            style={{
              color: c.background,
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              letterSpacing: 0.1,
            }}
          >
            {label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
