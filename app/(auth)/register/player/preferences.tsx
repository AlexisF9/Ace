import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { useRegisterStore } from "../../../../stores/registerStore";
import { useAuthStore } from "../../../../stores/authStore";
import { supabase } from "../../../../lib/supabase";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PlayerPreferencesScreen() {
  const router = useRouter();
  const { player, updatePlayer, reset } = useRegisterStore();
  const { signUp, refreshProfile } = useAuthStore();
  const { t } = useTranslation();

  const SURFACES = [
    { key: "clay", label: t("playerPreferences.surfaces.clay") },
    { key: "hard", label: t("playerPreferences.surfaces.hard") },
    { key: "grass", label: t("playerPreferences.surfaces.grass") },
    { key: "indoor", label: t("playerPreferences.surfaces.indoor") },
  ];

  const DAYS = [
    { key: "mon", label: t("playerPreferences.days.mon") },
    { key: "tue", label: t("playerPreferences.days.tue") },
    { key: "wed", label: t("playerPreferences.days.wed") },
    { key: "thu", label: t("playerPreferences.days.thu") },
    { key: "fri", label: t("playerPreferences.days.fri") },
    { key: "sat", label: t("playerPreferences.days.sat") },
    { key: "sun", label: t("playerPreferences.days.sun") },
  ];

  const [surface, setSurface] = useState<string | null>(player.favoriteSurface);
  const [availability, setAvailability] = useState<string[]>(player.availability);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFinish = async () => {
    updatePlayer({ favoriteSurface: surface, availability });
    setLoading(true);
    setError(null);

    try {
      const finalPlayer = { ...player, favoriteSurface: surface, availability };

      // 1. Créer le compte Supabase Auth
      const { error: signUpError, userId } = await signUp(
        finalPlayer.email,
        finalPlayer.password,
        {
          account_type: "player",
          username: finalPlayer.username,
          first_name: finalPlayer.firstName,
          last_name: finalPlayer.lastName,
          city: finalPlayer.city,
        }
      );
      if (signUpError) { setError(signUpError); setLoading(false); return; }
      if (!userId) { setError(t("common.authError")); setLoading(false); return; }

      // 2. Upload de l'avatar si une photo a été choisie
      let avatarUrl: string | null = null;
      if (finalPlayer.avatarUri) {
        try {
          const ext = finalPlayer.avatarUri.split(".").pop()?.toLowerCase() ?? "jpg";
          const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
            : ext === "png" ? "image/png"
            : ext === "heic" ? "image/heic"
            : `image/${ext}`;
          const path = `${userId}/avatar.${ext}`;

          const base64 = await FileSystem.readAsStringAsync(finalPlayer.avatarUri, {
            encoding: "base64",
          });

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, decode(base64), { contentType: mimeType, upsert: true });

          if (!uploadError) {
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            avatarUrl = data.publicUrl;
          }
        } catch {
          // Upload avatar échoué silencieusement — l'inscription continue sans photo
        }
      }

      // 3. Mettre à jour le profil
      await supabase.from("accounts").upsert({
        id: userId,
        account_type: "player",
        username: finalPlayer.username,
        city: finalPlayer.city,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });

      await supabase.from("player_accounts").upsert({
        profile_id: userId,
        first_name: finalPlayer.firstName,
        last_name: finalPlayer.lastName,
      });

      // 4. Sports
      const sportsRows = finalPlayer.sports.map((s) => ({
        profile_id: userId!,
        sport: s.sport,
        level: s.level,
        hidden: false,
      }));
      await supabase.from("player_sports").upsert(sportsRows);

      await refreshProfile();
      reset();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? t("common.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-6 pt-14 pb-8"
    >
      <StepIndicator current={4} total={4} />

      <Text className="font-display text-ink text-2xl mt-6 mb-1">
        {t("playerPreferences.title")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm mb-8">
        {t("playerPreferences.subtitle")}
      </Text>

      {/* Surface */}
      <Text className="font-display-semi text-ink-secondary text-sm mb-3">
        {t("playerPreferences.favoriteSurface")}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {SURFACES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSurface(surface === key ? null : key)}
            className={`px-4 py-2 rounded-pill border ${
              surface === key
                ? "bg-orange border-orange"
                : "bg-white border-ink-border"
            }`}
          >
            <Text
              className={`font-display-semi text-sm ${
                surface === key ? "text-white" : "text-ink-secondary"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Disponibilités */}
      <Text className="font-display-semi text-ink-secondary text-sm mb-3">
        {t("playerPreferences.availability")}
      </Text>
      <View className="flex-row gap-2 mb-8">
        {DAYS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => toggleDay(key)}
            className={`flex-1 py-2.5 rounded-md items-center border ${
              availability.includes(key)
                ? "bg-orange border-orange"
                : "bg-white border-ink-border"
            }`}
          >
            <Text
              className={`font-display-semi text-xs ${
                availability.includes(key) ? "text-white" : "text-ink-tertiary"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <Text className="font-body text-xs text-error mb-4 text-center">
          {error}
        </Text>
      )}

      <Button
        label={t("playerPreferences.finish")}
        onPress={handleFinish}
        loading={loading}
      />

      <TouchableOpacity
        onPress={handleFinish}
        className="mt-3 items-center"
        disabled={loading}
      >
        <Text className="font-body text-ink-tertiary text-sm">
          {t("playerPreferences.skip")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
