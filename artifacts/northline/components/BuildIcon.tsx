import { Feather } from "@expo/vector-icons";
import React from "react";

import type { BuildCategory } from "@/lib/types";

const ICON_MAP: Record<
  BuildCategory,
  React.ComponentProps<typeof Feather>["name"]
> = {
  skill: "compass",
  body: "heart",
  wealth: "trending-up",
  people: "users",
  mind: "moon",
  drift: "coffee",
};

export function BuildIcon({
  category,
  size = 14,
  color,
}: {
  category: BuildCategory;
  size?: number;
  color: string;
}) {
  return <Feather name={ICON_MAP[category]} size={size} color={color} />;
}
