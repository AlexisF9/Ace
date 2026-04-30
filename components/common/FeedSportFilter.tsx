import { View, Text, TouchableOpacity } from "react-native";
import { useSportsStore } from "../../stores/sportsStore";
import { useTranslation } from "../../hooks/useTranslation";

export function FeedSportFilter() {
  const { visibleSports, feedFilter, setFeedFilter } = useSportsStore();
  const { t } = useTranslation();

  if (visibleSports.length <= 1) return null;

  return (
    <View className="flex-row bg-surface mx-4 p-1 rounded-lg gap-1 mb-3">
      <TouchableOpacity
        onPress={() => setFeedFilter(null)}
        className={`flex-1 py-2 rounded-md items-center ${
          feedFilter === null ? "bg-ink" : ""
        }`}
      >
        <Text
          className={`font-display-semi text-sm ${
            feedFilter === null ? "text-white" : "text-ink-tertiary"
          }`}
        >
          {t("feedFilter.all")}
        </Text>
      </TouchableOpacity>

      {visibleSports.includes("tennis") && (
        <TouchableOpacity
          onPress={() => setFeedFilter("tennis")}
          className={`flex-1 py-2 rounded-md items-center ${
            feedFilter === "tennis" ? "bg-orange" : ""
          }`}
        >
          <Text
            className={`font-display-semi text-sm ${
              feedFilter === "tennis" ? "text-white" : "text-ink-tertiary"
            }`}
          >
            {t("common.tennis")}
          </Text>
        </TouchableOpacity>
      )}

      {visibleSports.includes("padel") && (
        <TouchableOpacity
          onPress={() => setFeedFilter("padel")}
          className={`flex-1 py-2 rounded-md items-center ${
            feedFilter === "padel" ? "bg-orange" : ""
          }`}
        >
          <Text
            className={`font-display-semi text-sm ${
              feedFilter === "padel" ? "text-white" : "text-ink-tertiary"
            }`}
          >
            {t("common.padel")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
