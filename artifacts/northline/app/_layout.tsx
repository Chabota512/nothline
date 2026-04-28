import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Onboarding } from "@/components/Onboarding";
import { BlocksProvider } from "@/contexts/BlocksContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import * as storage from "@/lib/storage";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === "web" && typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    html, body { overflow-x: hidden; }
  `;
  document.head.appendChild(style);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="audit"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const done = await storage.getOnboarded();
      if (cancel) return;
      setShowOnboarding(!done);
      setChecked(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (!checked) return null;

  return (
    <>
      {children}
      <Onboarding
        visible={showOnboarding}
        onDone={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <SettingsProvider>
                <BlocksProvider>
                  <StatusBar hidden />
                  <OnboardingGate>
                    <RootLayoutNav />
                  </OnboardingGate>
                </BlocksProvider>
              </SettingsProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
