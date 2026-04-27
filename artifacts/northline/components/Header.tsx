import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function Header({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  const c = useColors();
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 22 }}>
      {kicker ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {kicker}
        </Text>
      ) : null}
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 30,
          letterSpacing: -0.6,
          lineHeight: 34,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
