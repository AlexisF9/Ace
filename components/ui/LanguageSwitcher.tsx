import { View, Text, TouchableOpacity } from "react-native";
import { useI18nStore, Lang } from "../../stores/i18nStore";

interface LanguageSwitcherProps {
  /** "dark" = sur fond sombre (welcome), "light" = sur fond clair (profil) */
  variant?: "dark" | "light";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { lang, setLang } = useI18nStore();

  const isDark = variant === "dark";

  return (
    <View className={`flex-row rounded-md overflow-hidden border ${isDark ? "border-white/30" : "border-ink-border"}`}>
      {(["fr", "en"] as Lang[]).map((l, i) => {
        const isActive = lang === l;
        return (
          <TouchableOpacity
            key={l}
            onPress={() => setLang(l)}
            className={[
              "px-4 py-2",
              i === 0 ? "" : `border-l ${isDark ? "border-white/30" : "border-ink-border"}`,
              isActive
                ? isDark ? "bg-white" : "bg-ink"
                : "bg-transparent",
            ].join(" ")}
          >
            <Text
              className={`font-display-semi text-sm ${
                isActive
                  ? isDark ? "text-ink" : "text-white"
                  : isDark ? "text-white/60" : "text-ink-tertiary"
              }`}
            >
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
