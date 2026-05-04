import { create } from "zustand";
import { Sport } from "../types";
import { supabase } from "../lib/supabase";

interface SportsState {
  activeSports: Sport[];

  initialize: (userId: string, accountType: "player" | "club") => Promise<void>;
  reset: () => void;
}

export const useSportsStore = create<SportsState>((set) => ({
  activeSports: [],

  initialize: async (userId, accountType) => {
    const table = accountType === "club" ? "club_sports" : "player_sports";
    const idField = accountType === "club" ? "club_id" : "profile_id";

    const { data } = await supabase
      .from(table)
      .select("sport")
      .eq(idField, userId);

    if (!data || data.length === 0) return;

    set({ activeSports: data.map((r: any) => r.sport as Sport) });
  },

  reset: () => set({ activeSports: [] }),
}));
