import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Sport, TennisLevel, PadelLevel } from "../../types";
import { SportEntry } from "../../stores/registerStore";
import { useTranslation } from "../../hooks/useTranslation";

const TENNIS_LEVELS: TennisLevel[] = [
  "NC", "40", "30/2", "30/1", "30", "15/2", "15/1", "15",
  "5/6", "4/6", "3/6", "2/6", "1/6", "0",
];

const PADEL_LEVELS: PadelLevel[] = [
  "P25", "P50", "P100", "P200", "P250", "P300", "P500", "P1000",
];

interface SportSelectorProps {
  value: SportEntry[];
  onChange: (entries: SportEntry[]) => void;
}

export function SportSelector({ value, onChange }: SportSelectorProps) {
  const { t } = useTranslation();

  const hasTennis = value.some((e) => e.sport === "tennis");
  const hasPadel = value.some((e) => e.sport === "padel");

  const getTennisLevel = () =>
    value.find((e) => e.sport === "tennis")?.level ?? "";
  const getPadelLevel = () =>
    value.find((e) => e.sport === "padel")?.level ?? "";

  const toggleSport = (sport: Sport) => {
    if (value.some((e) => e.sport === sport)) {
      onChange(value.filter((e) => e.sport !== sport));
    } else {
      onChange([...value, { sport, level: "" }]);
    }
  };

  const setLevel = (sport: Sport, level: string) => {
    onChange(value.map((e) => (e.sport === sport ? { ...e, level } : e)));
  };

  return (
    <View className="gap-4">
      {/* Tennis card */}
      <View
        className={`border rounded-lg p-4 ${
          hasTennis ? "border-orange bg-orange-light" : "border-ink-border bg-white"
        }`}
      >
        <TouchableOpacity
          onPress={() => toggleSport("tennis")}
          className="flex-row items-center gap-3"
        >
          <View
            className={`w-5 h-5 rounded-sm border-2 items-center justify-center ${
              hasTennis ? "bg-orange border-orange" : "border-ink-border"
            }`}
          >
            {hasTennis && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="font-display-semi text-ink text-base">
            🎾 Tennis
          </Text>
        </TouchableOpacity>

        {hasTennis && (
          <View className="mt-3">
            <Text className="font-display-semi text-ink-secondary text-xs mb-2">
              {t("sportSelector.tennisLevel")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {TENNIS_LEVELS.map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => setLevel("tennis", lvl)}
                    className={`px-3 py-1.5 rounded-pill border ${
                      getTennisLevel() === lvl
                        ? "bg-orange border-orange"
                        : "bg-white border-ink-border"
                    }`}
                  >
                    <Text
                      className={`font-display-semi text-xs ${
                        getTennisLevel() === lvl ? "text-white" : "text-ink-secondary"
                      }`}
                    >
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Padel card */}
      <View
        className={`border rounded-lg p-4 ${
          hasPadel ? "border-orange bg-orange-light" : "border-ink-border bg-white"
        }`}
      >
        <TouchableOpacity
          onPress={() => toggleSport("padel")}
          className="flex-row items-center gap-3"
        >
          <View
            className={`w-5 h-5 rounded-sm border-2 items-center justify-center ${
              hasPadel ? "bg-orange border-orange" : "border-ink-border"
            }`}
          >
            {hasPadel && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="font-display-semi text-ink text-base">
            🏓 Padel
          </Text>
        </TouchableOpacity>

        {hasPadel && (
          <View className="mt-3">
            <Text className="font-display-semi text-ink-secondary text-xs mb-2">
              {t("sportSelector.padelLevel")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {PADEL_LEVELS.map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => setLevel("padel", lvl)}
                    className={`px-3 py-1.5 rounded-pill border ${
                      getPadelLevel() === lvl
                        ? "bg-orange border-orange"
                        : "bg-white border-ink-border"
                    }`}
                  >
                    <Text
                      className={`font-display-semi text-xs ${
                        getPadelLevel() === lvl ? "text-white" : "text-ink-secondary"
                      }`}
                    >
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
