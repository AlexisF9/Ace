import { View, Text } from "react-native";
import { Sport } from "../../types";

interface SportEntry {
  sport: Sport;
  level?: string;
}

interface SportTagProps {
  entries: SportEntry[];
  size?: "sm" | "md";
}

export function SportTag({ entries, size = "sm" }: SportTagProps) {
  const label = entries
    .map(
      (e) =>
        `${e.sport === "tennis" ? "Tennis" : "Padel"}${e.level ? ` ${e.level}` : ""}`,
    )
    .join(" / ");

  return (
    <View
      className={`rounded-pill border border-orange items-center justify-center ${
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1"
      }`}
    >
      <Text
        className={`font-display-semi text-orange ${
          size === "sm" ? "text-[10px]" : "text-xs"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
