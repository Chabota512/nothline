import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { useSettings } from "@/contexts/SettingsContext";
import { useColors } from "@/hooks/useColors";
import * as storage from "@/lib/storage";
import { REMINDER_INTERVAL_OPTIONS } from "@/lib/types";

type Props = {
  visible: boolean;
  onDone: () => void;
};

const SLIDES = [
  {
    icon: "clock" as const,
    kicker: "Welcome",
    title: "A quiet log of your time.",
    body: "Northline is a simple time tracker. No goals, no scoring — just an honest record of how your hours actually spend themselves.",
  },
  {
    icon: "edit-3" as const,
    kicker: "Capture",
    title: "Log a moment as it happens.",
    body: "Tap the + button to write down what you just did, in your own words. Tag it however helps you see your week.",
  },
  {
    icon: "bell" as const,
    kicker: "Reminders",
    title: "Get a quiet nudge (optional).",
    body: "Memory fades fast. A small notification every so often makes capturing easy. You can change or turn this off anytime in Settings.",
  },
] as const;

export function Onboarding({ visible, onDone }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const [step, setStep] = useState(0);
  const [enableReminders, setEnableReminders] = useState(true);
  const [interval, setInterval] = useState(
    settings.reminderIntervalMinutes,
  );
  const [working, setWorking] = useState(false);

  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  const finish = async (): Promise<void> => {
    setWorking(true);
    if (enableReminders && Platform.OS !== "web") {
      await updateSettings({
        reminderEnabled: true,
        reminderIntervalMinutes: interval,
      });
    }
    await storage.setOnboarded();
    setWorking(false);
    onDone();
  };

  const skip = async (): Promise<void> => {
    await storage.setOnboarded();
    onDone();
  };

  const next = async (): Promise<void> => {
    if (isLast) {
      await finish();
    } else {
      setStep(step + 1);
    }
  };

  const topPad = Platform.OS === "web" ? 40 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDone}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 28,
        }}
      >
        {/* Top row: skip + progress */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 36,
          }}
        >
          <View style={{ flexDirection: "row", gap: 6 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === step ? c.primary : c.border,
                }}
              />
            ))}
          </View>
          <Pressable onPress={skip} hitSlop={10}>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Slide */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <Feather name={slide.icon} size={22} color={c.primary} />
          </View>

          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {slide.kicker}
          </Text>

          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 30,
              letterSpacing: -0.6,
              lineHeight: 36,
              marginBottom: 16,
            }}
          >
            {slide.title}
          </Text>

          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 23,
            }}
          >
            {slide.body}
          </Text>

          {/* Reminder controls on last slide */}
          {isLast && Platform.OS !== "web" ? (
            <View style={{ marginTop: 28 }}>
              <View
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: c.border,
                }}
              >
                <Pressable
                  onPress={() => setEnableReminders(!enableReminders)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: enableReminders ? c.primary : c.border,
                      backgroundColor: enableReminders
                        ? c.primary
                        : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {enableReminders ? (
                      <Feather name="check" size={14} color={c.background} />
                    ) : null}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      color: c.foreground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                    }}
                  >
                    Send me a reminder
                  </Text>
                </Pressable>

                {enableReminders ? (
                  <View style={{ marginTop: 16 }}>
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
                          selected={interval === mins}
                          onPress={() => setInterval(mins)}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {isLast && Platform.OS === "web" ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 20,
                lineHeight: 19,
                fontStyle: "italic",
              }}
            >
              Reminders are available on iOS and Android.
            </Text>
          ) : null}
        </View>

        {/* Continue */}
        <Pressable
          onPress={next}
          disabled={working}
          style={{
            backgroundColor: c.foreground,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: working ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: c.background,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              letterSpacing: 0.2,
            }}
          >
            {isLast ? "Get started" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
