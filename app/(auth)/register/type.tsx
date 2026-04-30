import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useRegisterStore } from "../../../stores/registerStore";
import { useTranslation } from "../../../hooks/useTranslation";

export default function AccountTypeScreen() {
  const router = useRouter();
  const { accountType, setAccountType } = useRegisterStore();
  const { t } = useTranslation();

  const select = (type: "player" | "club") => {
    setAccountType(type);
    router.push(
      type === "player"
        ? "/(auth)/register/player/credentials"
        : "/(auth)/register/club/credentials",
    );
  };

  return (
    <View className="flex-1 bg-surface px-6 justify-center">
      <Text className="font-display text-ink text-2xl mb-2">
        {t("registerType.title")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm mb-8">
        {t("registerType.subtitle")}
      </Text>

      <View className="gap-4">
        <TouchableOpacity
          onPress={() => select("player")}
          className={`border-2 rounded-xl p-5 ${
            accountType === "player"
              ? "border-orange bg-orange-light"
              : "border-ink-border bg-white"
          }`}
        >
          <Text className="text-3xl mb-2">👤</Text>
          <Text className="font-display text-ink text-lg mb-1">
            {t("registerType.playerTitle")}
          </Text>
          <Text className="font-body text-ink-tertiary text-sm">
            {t("registerType.playerDesc")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => select("club")}
          className={`border-2 rounded-xl p-5 ${
            accountType === "club"
              ? "border-orange bg-orange-light"
              : "border-ink-border bg-white"
          }`}
        >
          <Text className="text-3xl mb-2">🏟️</Text>
          <Text className="font-display text-ink text-lg mb-1">
            {t("registerType.clubTitle")}
          </Text>
          <Text className="font-body text-ink-tertiary text-sm">
            {t("registerType.clubDesc")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
