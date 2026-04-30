import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type Lang = "fr" | "en";

const STORAGE_KEY = "ace_lang";

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: "fr",

  setLang: async (lang) => {
    set({ lang });
    await SecureStore.setItemAsync(STORAGE_KEY, lang);
  },

  initialize: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored === "fr" || stored === "en") {
        set({ lang: stored });
      }
    } catch {
      // ignore — default to "fr"
    }
  },
}));
