import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useTranslation } from "../../hooks/useTranslation";
import { colors } from "../../constants/theme";

interface PublicProfile {
  username: string;
  avatar_url: string | null;
  account_type: string;
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("accounts")
      .select("username, avatar_url, account_type")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  const initial = profile ? profile.username[0].toUpperCase() : "?";

  return (
    <View className="flex-1 bg-surface px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-1 -ml-1 self-start mb-4"
      >
        <ArrowLeft size={22} color={colors.ink} strokeWidth={2} />
      </TouchableOpacity>

      {profile ? (
        <View className="items-center">
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-20 h-20 rounded-pill"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-pill bg-orange-light items-center justify-center">
              <Text className="font-display-semi text-orange text-2xl">
                {initial}
              </Text>
            </View>
          )}
          <Text className="font-display-semi text-ink text-xl mt-4">
            @{profile.username}
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-ink-tertiary text-sm">
            {t("publicProfile.notFound")}
          </Text>
        </View>
      )}
    </View>
  );
}
