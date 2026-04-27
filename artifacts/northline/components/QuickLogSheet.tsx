import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { MINUTE, formatTime } from "@/lib/time";
import { BUILD_CATEGORIES, type BuildCategory, type TimeBlock } from "@/lib/types";
import { SECONDARY_LEAKAGE, SUGGESTED_ACTIVITIES } from "@/lib/suggestions";

import { BuildIcon } from "./BuildIcon";
import { Chip } from "./Chip";
import { EnergyDots } from "./EnergyDots";
import { KeyboardAwareScrollViewCompat } from "./KeyboardAwareScrollViewCompat";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (b: Omit<TimeBlock, "id" | "createdAt">) => void;
  initialStart?: number;
  initialEnd?: number;
  isReconstructed?: boolean;
  title?: string;
};

const DURATIONS = [15, 30, 45, 60, 90, 120];

export function QuickLogSheet({
  visible,
  onClose,
  onSave,
  initialStart,
  initialEnd,
  isReconstructed = false,
  title = "Capture a moment",
}: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [primary, setPrimary] = useState("");
  const [builds, setBuilds] = useState<BuildCategory | undefined>();
  const [secondary, setSecondary] = useState<string | undefined>();
  const [energy, setEnergy] = useState<number | undefined>();
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState(60);
  const [endTime, setEndTime] = useState<number>(Date.now());

  useEffect(() => {
    if (visible) {
      setPrimary("");
      setBuilds(undefined);
      setSecondary(undefined);
      setEnergy(undefined);
      setNote("");
      const end = initialEnd ?? Date.now();
      const start = initialStart ?? end - 60 * MINUTE;
      setEndTime(end);
      setDuration(Math.max(5, Math.round((end - start) / MINUTE)));
    }
  }, [visible, initialStart, initialEnd]);

  const startTime = useMemo(
    () => endTime - duration * MINUTE,
    [endTime, duration],
  );

  const handleSave = (): void => {
    if (!primary.trim()) return;
    onSave({
      startTime,
      endTime,
      primaryActivity: primary.trim(),
      secondaryActivity: secondary,
      builds,
      energy: energy as TimeBlock["energy"],
      note: note.trim() || undefined,
      isReconstructed,
    });
  };

  const bottomPad = isWeb ? 34 : insets.bottom;

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
            <Pressable onPress={onClose} hitSlop={10}>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                }}
              >
                Cancel
              </Text>
            </Pressable>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
              }}
            >
              {title}
            </Text>
            <Pressable
              onPress={handleSave}
              hitSlop={10}
              disabled={!primary.trim()}
            >
              <Text
                style={{
                  color: primary.trim() ? c.primary : c.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                }}
              >
                Save
              </Text>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            keyboardShouldPersistTaps="handled"
            bottomOffset={20}
            contentContainerStyle={{ paddingBottom: 20 + bottomPad }}
          >
            {/* When */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                WHEN
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
                    fontSize: 18,
                    letterSpacing: -0.3,
                  }}
                >
                  {formatTime(startTime)} — {formatTime(endTime)}
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {duration} minutes
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  {DURATIONS.map((m) => (
                    <Chip
                      key={m}
                      small
                      label={`${m}m`}
                      selected={duration === m}
                      onPress={() => setDuration(m)}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Activity */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                ACTIVITY
              </Text>
              <TextInput
                value={primary}
                onChangeText={setPrimary}
                placeholder="What were you actually doing?"
                placeholderTextColor={c.mutedForeground}
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: c.border,
                  color: c.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                }}
                returnKeyType="done"
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {SUGGESTED_ACTIVITIES.slice(0, 10).map((s) => (
                  <Chip
                    key={s}
                    small
                    label={s}
                    selected={primary === s}
                    onPress={() => setPrimary(s)}
                  />
                ))}
              </View>
            </View>

            {/* Builds what */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                WHAT DID THIS BUILD?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {BUILD_CATEGORIES.map((cat) => {
                  const selected = builds === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        setBuilds(selected ? undefined : cat.id)
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          backgroundColor: selected ? c.foreground : c.card,
                          borderColor: selected ? c.foreground : c.border,
                          borderWidth: StyleSheet.hairlineWidth,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 999,
                        }}
                      >
                        <BuildIcon
                          category={cat.id}
                          color={
                            selected ? c.background : c.mutedForeground
                          }
                          size={12}
                        />
                        <Text
                          style={{
                            color: selected ? c.background : c.foreground,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            letterSpacing: 0.2,
                          }}
                        >
                          {cat.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Attention leakage */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                ATTENTION LEAKAGE (OPTIONAL)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {SECONDARY_LEAKAGE.map((s) => (
                  <Chip
                    key={s}
                    small
                    label={s}
                    selected={secondary === s}
                    onPress={() =>
                      setSecondary(secondary === s ? undefined : s)
                    }
                  />
                ))}
              </View>
            </View>

            {/* Energy */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                ENERGY (OPTIONAL)
              </Text>
              <View
                style={[
                  styles.surface,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <EnergyDots
                  value={energy}
                  onChange={setEnergy}
                  showLabel={false}
                  size={20}
                />
              </View>
            </View>

            {/* Note */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                NOTE (OPTIONAL)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="A line for your future self"
                placeholderTextColor={c.mutedForeground}
                multiline
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: c.border,
                  color: c.foreground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  minHeight: 64,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </KeyboardAwareScrollViewCompat>
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
});
