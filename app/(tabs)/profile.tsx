import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import { useTranslation } from "../../hooks/useTranslation";
import { supabase } from "../../lib/supabase";
import { SportEntry } from "../../stores/registerStore";

function Avatar({ url, username }: { url?: string; username?: string }) {
  const initial = (username ?? "?")[0].toUpperCase();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        className="w-24 h-24 rounded-pill bg-orange-light"
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="w-24 h-24 rounded-pill bg-orange-light items-center justify-center">
      <Text className="font-display-bold text-orange text-3xl">{initial}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthStore();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [sportEntries, setSportEntries] = useState<SportEntry[]>([]);

  const isPlayer = profile?.account_type === "player";

  useEffect(() => {
    if (!session || !isPlayer) return;
    supabase
      .from("player_sports")
      .select("sport, level")
      .eq("profile_id", session.user.id)
      .then(({ data }) => setSportEntries((data ?? []) as SportEntry[]));
  }, [session, isPlayer]);

  return (
    <View className="flex-1 bg-surface p-4">
      <ScrollView className="flex-1">
        <View className="flex-row justify-between gap-2 mb-6">
          <View>
            <Avatar url={profile?.avatar_url} username={profile?.username} />

            <Text className="font-display-bold text-ink text-xl mt-4">
              @{profile?.username ?? "..."}
            </Text>
            <Text className="font-body text-ink-tertiary text-sm mt-1">
              {profile?.account_type === "player"
                ? t("profile.player")
                : t("profile.club")}
              {profile?.city ? ` · ${profile.city}` : ""}
            </Text>
          </View>

          <View className="gap-4 h-min">
            <LanguageSwitcher variant="light" />
          </View>
        </View>

        {/* Sports */}
        {isPlayer && (
          <View className="w-full mb-4">
            <Button
              label={t("profile.editProfile")}
              onPress={() => setModalVisible(true)}
              variant="outline-orange"
            />
          </View>
        )}

        <Button
          label={t("profile.signOut")}
          onPress={signOut}
          variant="danger"
        />
      </ScrollView>

      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        sportEntries={sportEntries}
        onChange={setSportEntries}
        city={profile?.city}
        avatarUrl={profile?.avatar_url}
      />
    </View>
  );
}
