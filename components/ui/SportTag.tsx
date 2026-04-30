import { View, Text } from "react-native";
import { Sport } from "../../types";

interface SportTagProps {
  sport: Sport;
  size?: "sm" | "md";
  level?: string;
}

export function SportTag({ sport, size = "sm", level }: SportTagProps) {
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
        {sport === "tennis" ? "Tennis" : "Padel"} {level && `- ${level}`}
      </Text>
    </View>
  );
}
