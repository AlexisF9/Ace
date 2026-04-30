import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useRegisterStore, SportEntry } from "../../../../stores/registerStore";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { SportSelector } from "../../../../components/register/SportSelector";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PlayerSportsScreen() {
  const router = useRouter();
  const { player, updatePlayer } = useRegisterStore();
  const { t } = useTranslation();
  const [sports, setSports] = useState<SportEntry[]>(player.sports);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (sports.length === 0) {
      setError(t("playerSports.errors.noSport"));
      return;
    }
    const missingLevel = sports.find((s) => !s.level);
    if (missingLevel) {
      setError(t("playerSports.errors.noLevel", { sport: missingLevel.sport }));
      return;
    }
    updatePlayer({ sports });
    router.push("/(auth)/register/player/preferences");
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-6 pt-14 pb-8"
    >
      <StepIndicator current={3} total={4} />

      <Text className="font-display text-ink text-2xl mt-6 mb-1">
        {t("playerSports.title")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm mb-8">
        {t("playerSports.subtitle")}
      </Text>

      <SportSelector value={sports} onChange={setSports} />

      {error && (
        <Text className="font-body text-xs text-error mt-4 text-center">
          {error}
        </Text>
      )}

      <View className="mt-8">
        <Button
          label={t("playerSports.next")}
          onPress={handleNext}
          disabled={sports.length === 0}
        />
      </View>
    </ScrollView>
  );
}
