import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { useRegisterStore } from "../../../../stores/registerStore";
import { useAuthStore } from "../../../../stores/authStore";
import { supabase } from "../../../../lib/supabase";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

async function uploadImage(
  bucket: string,
  path: string,
  uri: string,
): Promise<string | null> {
  try {
    const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
          ? "image/png"
          : ext === "heic"
            ? "image/heic"
            : `image/${ext}`;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${path}.${ext}`, decode(base64), {
        contentType: mimeType,
        upsert: true,
      });

    if (error) return null;
    return supabase.storage.from(bucket).getPublicUrl(`${path}.${ext}`).data
      .publicUrl;
  } catch {
    return null;
  }
}

export default function ClubPresentationScreen() {
  const router = useRouter();
  const { club, updateClub, reset } = useRegisterStore();
  const { signUp, refreshProfile } = useAuthStore();
  const { t } = useTranslation();

  const DAYS = [
    { key: "mon", label: t("clubPresentation.days.mon") },
    { key: "tue", label: t("clubPresentation.days.tue") },
    { key: "wed", label: t("clubPresentation.days.wed") },
    { key: "thu", label: t("clubPresentation.days.thu") },
    { key: "fri", label: t("clubPresentation.days.fri") },
    { key: "sat", label: t("clubPresentation.days.sat") },
    { key: "sun", label: t("clubPresentation.days.sun") },
  ];

  const [description, setDescription] = useState(club.description);
  const [hours, setHours] = useState<
    Record<string, { open: string; close: string }>
  >(club.openingHours);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHour = (day: string, field: "open" | "close", value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleFinish = async () => {
    updateClub({ description, openingHours: hours });
    setLoading(true);
    setError(null);

    try {
      const finalClub = { ...club, description, openingHours: hours };

      const username = finalClub.clubName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);

      const { error: signUpError, userId } = await signUp(
        finalClub.email,
        finalClub.password,
        {
          account_type: "club",
          username,
          club_name: finalClub.clubName,
          city: finalClub.city,
        },
      );
      if (signUpError) {
        setError(signUpError);
        setLoading(false);
        return;
      }
      if (!userId) {
        setError(t("common.authError"));
        setLoading(false);
        return;
      }

      // Upload logo → accounts.avatar_url
      const logoUrl = finalClub.logoUri
        ? await uploadImage("avatars", `${userId}/avatar`, finalClub.logoUri)
        : null;

      // Upload couverture → club_accounts.cover_url
      const coverUrl = finalClub.coverUri
        ? await uploadImage("covers", `${userId}/cover`, finalClub.coverUri)
        : null;

      // Mise à jour profil
      await supabase.from("accounts").upsert({
        id: userId,
        account_type: "club",
        username,
        city: finalClub.city,
        ...(logoUrl ? { avatar_url: logoUrl } : {}),
      });

      await supabase.from("club_accounts").upsert({
        profile_id: userId,
        club_name: finalClub.clubName,
        address: `${finalClub.address}, ${finalClub.postalCode} ${finalClub.city}`,
        postal_code: finalClub.postalCode,
        phone: finalClub.phone || null,
        website: finalClub.website || null,
        description: finalClub.description || null,
        opening_hours: Object.keys(finalClub.openingHours).length
          ? finalClub.openingHours
          : null,
        ...(coverUrl ? { cover_url: coverUrl } : {}),
      });

      // Sports
      const sportsRows = finalClub.sports.map((sport) => ({
        club_id: userId,
        sport,
      }));
      await supabase.from("club_sports").upsert(sportsRows);

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
      <StepIndicator current={5} total={5} />

      <Text className="font-display text-ink text-2xl mt-6 mb-1">
        {t("clubPresentation.title")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm mb-8">
        {t("clubPresentation.subtitle")}
      </Text>

      {/* Description */}
      <Text className="font-display-semi text-ink-secondary text-xs mb-1.5">
        {t("clubPresentation.description")}
      </Text>
      <TextInput
        className="bg-white border border-ink-border rounded-md px-4 py-3 font-body text-sm text-ink mb-6"
        placeholder={t("clubPresentation.descriptionPlaceholder")}
        placeholderTextColor="#8A8A8A"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
        textAlignVertical="top"
      />
      <Text className="font-body text-xs text-ink-tertiary -mt-4 mb-6 text-right">
        {description.length}/500
      </Text>

      {/* Horaires */}
      <Text className="font-display-semi text-ink-secondary text-xs mb-3">
        {t("clubPresentation.openingHours")}
      </Text>
      <View className="gap-2 mb-8">
        {DAYS.map(({ key, label }) => (
          <View key={key} className="flex-row items-center gap-3">
            <Text className="font-display-semi text-ink-secondary text-sm w-10">
              {label}
            </Text>
            <TextInput
              className="flex-1 bg-white border border-ink-border rounded-md px-3 py-2 font-body text-sm text-ink text-center"
              placeholder="08:00"
              placeholderTextColor="#8A8A8A"
              value={hours[key]?.open ?? ""}
              onChangeText={(v) => updateHour(key, "open", v)}
              maxLength={5}
            />
            <Text className="font-body text-ink-tertiary text-sm">—</Text>
            <TextInput
              className="flex-1 bg-white border border-ink-border rounded-md px-3 py-2 font-body text-sm text-ink text-center"
              placeholder="22:00"
              placeholderTextColor="#8A8A8A"
              value={hours[key]?.close ?? ""}
              onChangeText={(v) => updateHour(key, "close", v)}
              maxLength={5}
            />
          </View>
        ))}
      </View>

      {error && (
        <Text className="font-body text-xs text-error mb-4 text-center">
          {error}
        </Text>
      )}

      <Button
        label={t("clubPresentation.finish")}
        onPress={handleFinish}
        variant="primary"
        loading={loading}
      />

      <TouchableOpacity
        onPress={handleFinish}
        className="mt-3 items-center"
        disabled={loading}
      >
        <Text className="font-body text-ink-tertiary text-sm">
          {t("clubPresentation.skip")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
