import { create } from "zustand";
import { Sport } from "../types";
import { supabase } from "../lib/supabase";

interface SportsState {
  activeSports: Sport[];
  hiddenSport: Sport | null;
  feedFilter: Sport | null;
  visibleSports: Sport[]; // activeSports - hiddenSport

  initialize: (userId: string, accountType: "player" | "club") => Promise<void>;
  setHiddenSport: (sport: Sport | null, userId: string) => Promise<void>;
  setFeedFilter: (sport: Sport | null) => void;
  reset: () => void;
}

const computeVisible = (active: Sport[], hidden: Sport | null): Sport[] =>
  active.filter((s) => s !== hidden);

export const useSportsStore = create<SportsState>((set, get) => ({
  activeSports: [],
  hiddenSport: null,
  feedFilter: null,
  visibleSports: [],

  initialize: async (userId, accountType) => {
    const table = accountType === "club" ? "club_sports" : "player_sports";
    const idField = accountType === "club" ? "club_id" : "profile_id";

    const { data } = await supabase
      .from(table)
      .select("sport, hidden")
      .eq(idField, userId);

    if (!data || data.length === 0) return;

    const activeSports = data.map((r: any) => r.sport as Sport);
    const hiddenEntry = data.find((r: any) => r.hidden === true);
    const hiddenSport = hiddenEntry ? (hiddenEntry.sport as Sport) : null;

    set({
      activeSports,
      hiddenSport,
      visibleSports: computeVisible(activeSports, hiddenSport),
    });
  },

  setHiddenSport: async (sport, userId) => {
    const { activeSports } = get();

    set({
      hiddenSport: sport,
      visibleSports: computeVisible(activeSports, sport),
    });

    // Sync to Supabase
    await supabase
      .from("player_sports")
      .update({ hidden: false })
      .eq("profile_id", userId);

    if (sport) {
      await supabase
        .from("player_sports")
        .update({ hidden: true })
        .eq("profile_id", userId)
        .eq("sport", sport);
    }
  },

  setFeedFilter: (sport) => set({ feedFilter: sport }),

  reset: () =>
    set({ activeSports: [], hiddenSport: null, feedFilter: null, visibleSports: [] }),
}));
