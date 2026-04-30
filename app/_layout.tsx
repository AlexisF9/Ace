import { useEffect } from "react";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import "../global.css";
import { useAuthStore } from "../stores/authStore";
import { useI18nStore } from "../stores/i18nStore";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const { initialize } = useAuthStore();
  const { initialize: initLang } = useI18nStore();

  const [loaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) {
      initLang()
        .then(() => initialize())
        .then(() => SplashScreen.hideAsync());
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-surface">
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
