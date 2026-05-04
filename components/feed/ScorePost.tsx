import { View, Text } from "react-native";
import { Match } from "../../types";

const SURFACE_LABEL: Record<string, string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  indoor: "Indoor",
};

interface ScorePostProps {
  match: Match;
}

export function ScorePost({ match }: ScorePostProps) {
  const scoreStr = match.score.sets.map((s) => `${s.p1} – ${s.p2}`).join("  ");

  return (
    <View className="px-4">
      <Text className="font-display-bold text-ink text-2xl tracking-tighter">
        {scoreStr}
      </Text>
      {match.surface && (
        <Text className="font-body text-ink-tertiary text-xs mt-1">
          {SURFACE_LABEL[match.surface] ?? match.surface}
        </Text>
      )}
    </View>
  );
}
