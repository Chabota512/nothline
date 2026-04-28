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

import { useBlocks } from "@/contexts/BlocksContext";
import { useColors } from "@/hooks/useColors";
import { suggestActivities, suggestSecondary } from "@/lib/suggestions";
import { formatTime } from "@/lib/time";
import type { ScheduledBlock } from "@/lib/types";

import { Chip } from "./Chip";
import { EnergyDots } from "./EnergyDots";
import { KeyboardAwareScrollViewCompat } from "./KeyboardAwareScrollViewCompat";

type Props = {
  visible: boolean;
  block: ScheduledBlock | null;
  onClose: () => void;
};

export function QuickLogSheet({ visible, block, onClose }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { logBlock, allLoggedBlocks } = useBlocks();

  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [energy, setEnergy] = useState<number | undefined>();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setPrimary(block?.primaryActivity ?? "");
      setSecondary(block?.secondaryActivity ?? "");
      setEnergy(block?.energy);
      setNote(block?.note ?? "");
      setSaving(false);
    }
  }, [visible, block]);

  const primarySuggestions = useMemo(
    () =>
      block ? suggestActivities(allLoggedBlocks, block.startTime, 6) : [],
    [allLoggedBlocks, block],
  );

  const secondarySuggestions = useMemo(
    () => suggestSecondary(allLoggedBlocks, 4),
    [allLoggedBlocks],
  );

  const handleSave = async (): Promise<void> => {
    if (!block || !primary.trim() || saving) return;
    setSaving(true);
    await logBlock(block.id, {
      primaryActivity: primary.trim(),
      secondaryActivity: secondary.trim() || undefined,
      energy: energy as ScheduledBlock["energy"],
      note: note.trim() || undefined,
    });
    onClose();
  };

  const bottomPad = isWeb ? 34 : insets.bottom;

  const isMissed = block?.status === "missed";
  const isCurrent = !!block && Date.now() >= block.startTime && Date.now() < block.endTime;

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
              {isMissed ? "Fill missed block" : isCurrent ? "Log this block" : "Log block"}
            </Text>
            <Pressable
              onPress={handleSave}
              hitSlop={10}
              disabled={!primary.trim() || saving}
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

          {!block ? (
            <View style={{ padding: 24 }}>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                }}
              >
                No block selected.
              </Text>
            </View>
          ) : (
            <KeyboardAwareScrollViewCompat
              keyboardShouldPersistTaps="handled"
              bottomOffset={20}
              contentContainerStyle={{ paddingBottom: 20 + bottomPad }}
            >
              {/* When */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                >
                  TIME BLOCK
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
                    {formatTime(block.startTime)} — {formatTime(block.endTime)}
                  </Text>
                  <Text
                    style={{
                      color: isMissed ? c.primary : c.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {isMissed
                      ? "Missed — fill from memory"
                      : isCurrent
                        ? "Currently active"
                        : "Scheduled"}
                  </Text>
                </View>
              </View>

              {/* Primary activity */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                >
                  WHAT WERE YOU DOING?
                </Text>
                <TextInput
                  value={primary}
                  onChangeText={setPrimary}
                  placeholder="In your own words…"
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
                  autoFocus={!primary}
                />
                {primarySuggestions.length > 0 ? (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {primarySuggestions.map((s) => (
                      <Chip
                        key={s}
                        small
                        label={s}
                        selected={primary.toLowerCase() === s.toLowerCase()}
                        onPress={() => setPrimary(s)}
                      />
                    ))}
                  </View>
                ) : null}
              </View>

              {/* Secondary */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                >
                  AND ALONGSIDE? (OPTIONAL)
                </Text>
                <TextInput
                  value={secondary}
                  onChangeText={setSecondary}
                  placeholder="Phone, music, conversation…"
                  placeholderTextColor={c.mutedForeground}
                  style={{
                    backgroundColor: c.card,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: c.border,
                    color: c.foreground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                  }}
                  returnKeyType="done"
                />
                {secondarySuggestions.length > 0 ? (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {secondarySuggestions.map((s) => (
                      <Chip
                        key={s}
                        small
                        label={s}
                        selected={secondary.toLowerCase() === s.toLowerCase()}
                        onPress={() =>
                          setSecondary(
                            secondary.toLowerCase() === s.toLowerCase()
                              ? ""
                              : s,
                          )
                        }
                      />
                    ))}
                  </View>
                ) : null}
              </View>

              {/* Energy */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                >
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
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                >
                  NOTE (OPTIONAL)
                </Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="A line for later"
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
          )}
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
