import { useContext } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { SettingsCtx } from "@/contexts/SettingsContext";

/**
 * Returns the design tokens for the active color scheme.
 *
 * Reads the user's saved theme preference from SettingsContext when available
 * ("system" | "light" | "dark") and resolves it against the device color
 * scheme. Falls back to "system" when the SettingsProvider isn't mounted yet
 * (e.g. inside the ErrorBoundary fallback) so this hook never throws.
 */
export function useColors() {
  const systemScheme = useColorScheme();
  const settingsCtx = useContext(SettingsCtx);
  const pref = settingsCtx?.settings.themePreference ?? "system";

  const effectiveScheme = pref === "system" ? systemScheme : pref;

  const palette =
    effectiveScheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
