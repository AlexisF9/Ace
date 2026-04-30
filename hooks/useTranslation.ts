import { useI18nStore } from "../stores/i18nStore";
import fr from "../i18n/fr.json";
import en from "../i18n/en.json";

const translations = { fr, en } as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path;
}

export function useTranslation() {
  const { lang } = useI18nStore();
  const dict = translations[lang] as Record<string, unknown>;

  const t = (key: string, vars?: Record<string, string>): string => {
    let text = getNestedValue(dict, key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return { t, lang };
}
