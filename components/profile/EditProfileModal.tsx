import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import { useSportsStore } from "../../stores/sportsStore";
import { SportSelector } from "../register/SportSelector";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";
import { SportEntry } from "../../stores/registerStore";
import { colors } from "../../constants/theme";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  sportEntries: SportEntry[];
  onChange: (entries: SportEntry[]) => void;
  city?: string;
  avatarUrl?: string;
}

export function EditProfileModal({
  visible,
  onClose,
  sportEntries,
  onChange,
  city,
  avatarUrl,
}: EditProfileModalProps) {
  const { session, profile, refreshProfile } = useAuthStore();
  const { activeSports, initialize } = useSportsStore();
  const { t } = useTranslation();

  const [cityValue, setCityValue] = useState(city ?? "");
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCityValue(city ?? "");
      setNewAvatarUri(null);
      setError(null);
    }
  }, [visible, city]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setNewAvatarUri(result.assets[0].uri);
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!session) return;

    if (sportEntries.length === 0) {
      setError(t("profile.sportsMin"));
      return;
    }
    if (sportEntries.some((e) => !e.level)) {
      setError(t("profile.sportsLevelRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let newAvatarUrl: string | undefined;
      if (newAvatarUri) {
        const ext = newAvatarUri.split(".").pop()?.toLowerCase() ?? "jpg";
        const mimeType =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
              ? "image/png"
              : ext === "heic"
                ? "image/heic"
                : "image/jpeg";
        const path = `${session.user.id}/avatar`;
        const base64 = await FileSystem.readAsStringAsync(newAvatarUri, {
          encoding: "base64",
        });
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, decode(base64), { contentType: mimeType, upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { error: updateError } = await supabase
        .from("accounts")
        .update({
          city: cityValue.trim() || null,
          ...(newAvatarUrl ? { avatar_url: newAvatarUrl } : {}),
        })
        .eq("id", session.user.id);
      if (updateError) throw new Error(updateError.message);

      const newSportNames = sportEntries.map((e) => e.sport);
      const removedSports = activeSports.filter((s) => !newSportNames.includes(s));

      if (removedSports.length > 0) {
        await supabase
          .from("player_sports")
          .delete()
          .eq("profile_id", session.user.id)
          .in("sport", removedSports);
      }

      await supabase.from("player_sports").upsert(
        sportEntries.map((e) => ({
          profile_id: session.user.id,
          sport: e.sport,
          level: e.level,
          hidden: false,
        })),
      );

      await initialize(session.user.id, "player");
      await refreshProfile();

      handleClose();
    } catch (e: any) {
      setError(e.message ?? t("common.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = newAvatarUri ?? avatarUrl;
  const initial = (profile?.username ?? "?")[0].toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-surface"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-6 pt-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <Text className="font-display-bold text-ink text-2xl">
              {t("profile.editProfile")}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={22} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <TouchableOpacity onPress={pickAvatar} className="items-center mb-6">
            <View className="w-20 h-20 rounded-pill bg-orange-light items-center justify-center overflow-hidden">
              {displayAvatar ? (
                <Image
                  source={{ uri: displayAvatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-display-bold text-orange text-3xl">
                  {initial}
                </Text>
              )}
            </View>
            <Text className="font-display-semi text-ink-secondary text-sm mt-2">
              {displayAvatar
                ? t("playerProfile.changePhoto")
                : t("playerProfile.addPhoto")}
            </Text>
          </TouchableOpacity>

          {/* Ville */}
          <View className="mb-6">
            <Input
              label={t("playerProfile.city")}
              value={cityValue}
              onChangeText={setCityValue}
              placeholder="Lyon"
              autoCapitalize="words"
            />
          </View>

          {/* Sports */}
          <Text className="font-display-semi text-ink-secondary text-sm mb-3">
            {t("profile.mySports")}
          </Text>

          <SportSelector value={sportEntries} onChange={onChange} />

          {error && (
            <Text className="font-body text-xs text-error text-center mt-4">
              {error}
            </Text>
          )}

          <View className="mt-6">
            <Button
              label={t("profile.saveSports")}
              onPress={handleSave}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
