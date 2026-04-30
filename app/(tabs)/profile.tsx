import { View, Text, Image, Switch } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useSportsStore } from "../../stores/sportsStore";
import { Button } from "../../components/ui/Button";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { useTranslation } from "../../hooks/useTranslation";
import { Sport } from "../../types";

const SPORT_LABEL: Record<Sport, string> = {
  tennis: "Tennis",
  padel: "Padel",
};

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
  const { activeSports, hiddenSport, setHiddenSport } = useSportsStore();
  const { t } = useTranslation();

  const otherSport: Sport | null =
    activeSports.length === 1
      ? activeSports[0] === "tennis"
        ? "padel"
        : "tennis"
      : null;

  const isOtherHidden = otherSport !== null && hiddenSport === otherSport;

  const handleToggleOtherSport = () => {
    if (!otherSport || !session) return;
    setHiddenSport(isOtherHidden ? null : otherSport, session.user.id);
  };

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
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

      <Text className="font-body text-ink-tertiary text-xs mt-4 mb-6">
        Phase 4
      </Text>

      {/* Sélecteur de langue */}
      <View className="items-center mb-6 gap-2">
        <Text className="font-display-semi text-ink-tertiary text-xs">
          {t("profile.language")}
        </Text>
        <LanguageSwitcher variant="light" />
      </View>

      {otherSport && (
        <View className="w-full flex-row items-center justify-between bg-white border border-ink-border rounded-md px-4 py-3 mb-4">
          <Text className="font-body-medium text-ink-secondary text-sm">
            {t("profile.postsSport", { sport: SPORT_LABEL[otherSport] })}
          </Text>
          <Switch
            value={!isOtherHidden}
            onValueChange={handleToggleOtherSport}
            trackColor={{ false: "#D0D0D0", true: "#C4501A" }}
            thumbColor="#FFFFFF"
          />
        </View>
      )}

      <Button label={t("profile.signOut")} onPress={signOut} variant="ghost" />
    </View>
  );
}
