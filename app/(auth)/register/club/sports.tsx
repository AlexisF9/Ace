import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useRegisterStore } from "../../../../stores/registerStore";
import { Sport } from "../../../../types";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { Input } from "../../../../components/ui/Input";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function ClubSportsScreen() {
  const router = useRouter();
  const { club, updateClub } = useRegisterStore();
  const { t } = useTranslation();

  const TENNIS_SURFACES = [
    { key: "clay", label: t("clubSports.surfaces.clay") },
    { key: "hard", label: t("clubSports.surfaces.hard") },
    { key: "grass", label: t("clubSports.surfaces.grass") },
    { key: "indoor", label: t("clubSports.surfaces.indoor") },
  ];

  const PADEL_SURFACES = [
    { key: "grass_synthetic", label: t("clubSports.surfaces.grass_synthetic") },
    { key: "indoor", label: t("clubSports.surfaces.indoor") },
  ];

  const [sports, setSports] = useState<Sport[]>(club.sports);
  const [tennisCourts, setTennisCourts] = useState(String(club.tennisCourts || ""));
  const [tennisSurfaces, setTennisSurfaces] = useState<string[]>(club.tennisSurfaces);
  const [padelCourts, setPadelCourts] = useState(String(club.padelCourts || ""));
  const [padelSurfaces, setPadelSurfaces] = useState<string[]>(club.padelSurfaces);
  const [error, setError] = useState<string | null>(null);

  const hasTennis = sports.includes("tennis");
  const hasPadel = sports.includes("padel");

  const toggleSport = (sport: Sport) => {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const toggleSurface = (surface: string, list: string[], setter: (v: string[]) => void) => {
    setter(
      list.includes(surface)
        ? list.filter((s) => s !== surface)
        : [...list, surface],
    );
  };

  const handleNext = () => {
    if (sports.length === 0) {
      setError(t("clubSports.errors.noSport"));
      return;
    }
    updateClub({
      sports,
      tennisCourts: parseInt(tennisCourts) || 0,
      tennisSurfaces,
      padelCourts: parseInt(padelCourts) || 0,
      padelSurfaces,
    });
    router.push("/(auth)/register/club/presentation");
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-6 pt-14 pb-8"
    >
      <StepIndicator current={4} total={5} />

      <Text className="font-display text-ink text-2xl mt-6 mb-1">
        {t("clubSports.title")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm mb-8">
        {t("clubSports.subtitle")}
      </Text>

      {/* Sélection sports */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => toggleSport("tennis")}
          className={`flex-1 border-2 rounded-xl p-4 items-center ${
            hasTennis
              ? "border-orange bg-orange-light"
              : "border-ink-border bg-white"
          }`}
        >
          <Text className="text-2xl mb-1">🎾</Text>
          <Text
            className={`font-display-semi text-sm ${hasTennis ? "text-orange-dark" : "text-ink-secondary"}`}
          >
            Tennis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleSport("padel")}
          className={`flex-1 border-2 rounded-xl p-4 items-center ${
            hasPadel
              ? "border-orange bg-orange-light"
              : "border-ink-border bg-white"
          }`}
        >
          <Text className="text-2xl mb-1">🏓</Text>
          <Text
            className={`font-display-semi text-sm ${hasPadel ? "text-orange-dark" : "text-ink-secondary"}`}
          >
            Padel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tennis détails */}
      {hasTennis && (
        <View className="bg-orange-light border border-orange-light rounded-lg p-4 mb-4">
          <Text className="font-display-semi text-orange-dark text-sm mb-3">
            {t("clubSports.tennisCourts")}
          </Text>
          <Input
            label={t("clubSports.courtsCount")}
            value={tennisCourts}
            onChangeText={setTennisCourts}
            placeholder="4"
            keyboardType="numeric"
            maxLength={2}
          />
          <Text className="font-display-semi text-ink-secondary text-xs mt-3 mb-2">
            {t("clubSports.availableSurfaces")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TENNIS_SURFACES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => toggleSurface(key, tennisSurfaces, setTennisSurfaces)}
                className={`px-3 py-1.5 rounded-pill border ${
                  tennisSurfaces.includes(key)
                    ? "bg-orange border-orange"
                    : "bg-white border-ink-border"
                }`}
              >
                <Text
                  className={`font-display-semi text-xs ${
                    tennisSurfaces.includes(key) ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Padel détails */}
      {hasPadel && (
        <View className="bg-orange-light border border-orange-light rounded-lg p-4 mb-4">
          <Text className="font-display-semi text-orange-dark text-sm mb-3">
            {t("clubSports.padelCourts")}
          </Text>
          <Input
            label={t("clubSports.courtsCount")}
            value={padelCourts}
            onChangeText={setPadelCourts}
            placeholder="2"
            keyboardType="numeric"
            maxLength={2}
          />
          <Text className="font-display-semi text-ink-secondary text-xs mt-3 mb-2">
            {t("clubSports.availableSurfaces")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PADEL_SURFACES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => toggleSurface(key, padelSurfaces, setPadelSurfaces)}
                className={`px-3 py-1.5 rounded-pill border ${
                  padelSurfaces.includes(key)
                    ? "bg-orange border-orange"
                    : "bg-white border-ink-border"
                }`}
              >
                <Text
                  className={`font-display-semi text-xs ${
                    padelSurfaces.includes(key) ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {error && (
        <Text className="font-body text-xs text-error mb-4 text-center">
          {error}
        </Text>
      )}

      <Button
        label={t("clubSports.next")}
        onPress={handleNext}
        disabled={sports.length === 0}
      />
    </ScrollView>
  );
}
