import React, { useEffect, useState } from "react";
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
import type { Reflection } from "@/lib/types";

import { EnergyDots } from "./EnergyDots";
import { KeyboardAwareScrollViewCompat } from "./KeyboardAwareScrollViewCompat";

type Props = {
  visible: boolean;
  date: string;
  initial?: Reflection;
  onClose: () => void;
  onSave: (r: Omit<Reflection, "id" | "createdAt">) => void;
};

export function ReflectionSheet({
  visible,
  date,
  initial,
  onClose,
  onSave,
}: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [stoleTime, setStoleTime] = useState("");
  const [worked, setWorked] = useState("");
  const [energy, setEnergy] = useState<number | undefined>();

  useEffect(() => {
    if (visible) {
      setStoleTime(initial?.stoleTime ?? "");
      setWorked(initial?.worked ?? "");
      setEnergy(initial?.energy);
    }
  }, [visible, initial]);

  const handleSave = (): void => {
    onSave({
      date,
      stoleTime: stoleTime.trim() || undefined,
      worked: worked.trim() || undefined,
      energy: energy as Reflection["energy"],
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
              Day notes
            </Text>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Text
                style={{
                  color: c.primary,
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
            <View style={styles.section}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>
                NOTES
              </Text>
              <TextInput
                value={stoleTime}
                onChangeText={setStoleTime}
                placeholder="Anything you want to remember about today"
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

            <View style={styles.section}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>
                WORTH KEEPING
              </Text>
              <TextInput
                value={worked}
                onChangeText={setWorked}
                placeholder="A small thing to note for later"
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

            <View style={styles.section}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>
                ENERGY
              </Text>
              <View
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: c.border,
                }}
              >
                <EnergyDots
                  value={energy}
                  onChange={setEnergy}
                  showLabel={false}
                  size={20}
                />
              </View>
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
    paddingTop: 20,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: 10,
  },
});
