import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type IconName = React.ComponentProps<typeof Feather>["name"];

export function EmptyState({
  icon = "circle",
  title,
  body,
}: {
  icon?: IconName;
  title: string;
  body?: string;
}) {
  const c = useColors();
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 56,
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
          marginBottom: 16,
        }}
      >
        <Feather name={icon} size={22} color={c.mutedForeground} />
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 15,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            textAlign: "center",
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
