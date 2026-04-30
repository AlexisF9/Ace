import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../../hooks/useTranslation";

export default function RegisterMethodScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-surface px-6 justify-center">
      <Text className="font-display text-ink text-2xl mb-8">
        {t("registerMethod.title")}
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/register/type")}
        className="bg-orange rounded-md py-4 items-center"
      >
        <Text className="font-display text-white text-sm">
          {t("registerMethod.continueWithEmail")}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-8 gap-1">
        <Text className="font-body text-ink-tertiary text-sm">
          {t("registerMethod.alreadyAccount")}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text className="font-display-semi text-ink-secondary text-sm">
            {t("registerMethod.login")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
