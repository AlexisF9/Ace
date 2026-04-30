import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export function useProtectedRoute() {
  const { session, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments]);
}

export function useAuth() {
  return useAuthStore();
}
