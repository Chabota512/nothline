import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "@/contexts/SettingsContext";
import { useColors } from "@/hooks/useColors";
import {
  REMINDER_INTERVAL_OPTIONS,
  THEME_OPTIONS,
  type ThemePreference,
} from "@/lib/types";

import { Chip } from "./Chip";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SettingsSheet({ visible, onClose }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { settings, updateSettings, testNotification } = useSettings();

  const [permissionMessage, setPermissionMessage] = useState<string | null>(
    null,
  );
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleToggle = async (val: boolean): Promise<void> => {
    setPermissionMessage(null);
    const res = await updateSettings({ reminderEnabled: val });
    if (!res.ok && res.permissionDenied) {
      setPermissionMessage(
        "Notification permission was not granted. Enable it in your device settings, then try again.",
      );
    }
  };

  const handleInterval = async (mins: number): Promise<void> => {
    setPermissionMessage(null);
    await updateSettings({ reminderIntervalMinutes: mins });
  };

  const handleTheme = async (pref: ThemePreference): Promise<void> => {
    await updateSettings({ themePreference: pref });
  };

  const handleTest = async (): Promise<void> => {
    setTestMessage(null);
    const ok = await testNotification();
    setTestMessage(
      ok
        ? "A test reminder will appear in a few seconds."
        : "Couldn't send a test — notification permission is off.",
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={onClose}
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close"
        />
        <View
          style={{
            backgroundColor: c.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "92%",
            paddingTop: 8,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 42,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.border,
              marginBottom: 6,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: c.border,
            }}
          >
            <View style={{ width: 60 }} />
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
              }}
            >
              Settings
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={{ width: 60, alignItems: "flex-end" }}>
              <Text
                style={{
                  color: c.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 24 + bottomPad }}
            showsVerticalScrollIndicator={false}
          >
            {/* Reminders */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                REMINDERS
              </Text>

              <View
                style={[
                  styles.surface,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: c.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 15,
                      }}
                    >
                      Nudge me to log
                    </Text>
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        marginTop: 4,
                        lineHeight: 17,
                      }}
                    >
                      Northline will send a quiet notification, even on your
                      lock screen, asking what just happened.
                    </Text>
                  </View>
                  <Switch
                    value={settings.reminderEnabled}
                    onValueChange={handleToggle}
                    trackColor={{ false: c.border, true: c.primary }}
                    thumbColor={
                      Platform.OS === "android" ? c.background : undefined
                    }
                  />
                </View>

                {permissionMessage ? (
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      marginTop: 12,
                      lineHeight: 17,
                    }}
                  >
                    {permissionMessage}
                  </Text>
                ) : null}

                <View
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: c.border,
                  }}
                >
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Every
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {REMINDER_INTERVAL_OPTIONS.map((mins) => (
                      <Chip
                        key={mins}
                        small
                        label={`${mins} min`}
                        selected={settings.reminderIntervalMinutes === mins}
                        onPress={() => handleInterval(mins)}
                      />
                    ))}
                  </View>
                </View>

                {Platform.OS !== "web" ? (
                  <Pressable
                    onPress={handleTest}
                    style={{
                      marginTop: 18,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Feather name="bell" size={14} color={c.primary} />
                    <Text
                      style={{
                        color: c.primary,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                      }}
                    >
                      Send a test reminder
                    </Text>
                  </Pressable>
                ) : null}

                {testMessage ? (
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      marginTop: 8,
                      lineHeight: 17,
                    }}
                  >
                    {testMessage}
                  </Text>
                ) : null}
              </View>

              {Platform.OS === "web" ? (
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 10,
                    paddingHorizontal: 4,
                    lineHeight: 17,
                  }}
                >
                  Reminders run on iOS and Android. Open the app on your phone
                  to use them.
                </Text>
              ) : null}
            </View>

            {/* Appearance */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                APPEARANCE
              </Text>
              <View
                style={[
                  styles.surface,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                  }}
                >
                  Theme
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 4,
                    lineHeight: 17,
                  }}
                >
                  Match your device, or pick a fixed look.
                </Text>
                <View
                  style={{
                    marginTop: 14,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      small
                      label={opt.label}
                      selected={settings.themePreference === opt.id}
                      onPress={() => handleTheme(opt.id)}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                ABOUT
              </Text>
              <View
                style={[
                  styles.surface,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Northline keeps a quiet log of your time. Everything stays on
                  this device.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  surface: {
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});
