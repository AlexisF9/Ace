import { create } from "zustand";
import { Session, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";
import { useSportsStore } from "./sportsStore";

let accountChannel: RealtimeChannel | null = null;

function subscribeAccountDeletion(userId: string, onDeleted: () => void) {
  if (accountChannel) {
    supabase.removeChannel(accountChannel);
    accountChannel = null;
  }
  accountChannel = supabase
    .channel(`account-watch:${userId}`)
    .on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "accounts",
      filter: `id=eq.${userId}`,
    }, onDeleted)
    .subscribe();
}

function unsubscribeAccountDeletion() {
  if (accountChannel) {
    supabase.removeChannel(accountChannel);
    accountChannel = null;
  }
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileComplete: boolean; // false = pas encore de sports sélectionnés

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => Promise<{ error: string | null; userId: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  isProfileComplete: false,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Charge le profil AVANT de mettre isLoading à false
    // pour éviter un flash vers register/type au démarrage
    if (session) {
      await get().refreshProfile();
      subscribeAccountDeletion(session.user.id, () => get().signOut());
    }

    set({ session, isLoading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) {
        subscribeAccountDeletion(session.user.id, () => get().signOut());
      } else {
        unsubscribeAccountDeletion();
        set({ profile: null, isProfileComplete: false });
      }
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await get().refreshProfile();
    return { error: null };
  },

  signUp: async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) return { error: error.message, userId: null };
    return { error: null, userId: data.user?.id ?? null };
  },

  signOut: async () => {
    unsubscribeAccountDeletion();
    await supabase.auth.signOut();
    set({ session: null, profile: null, isProfileComplete: false });
    useSportsStore.getState().reset();
  },

  refreshProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      await supabase.auth.signOut();
      set({ session: null, profile: null, isProfileComplete: false });
      return;
    }

    const { data: profile } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      set({ session: null, profile: null, isProfileComplete: false });
      return;
    }

    // Vérifie si le profil a des sports sélectionnés
    const sportsTable = profile.account_type === "club" ? "club_sports" : "player_sports";
    const idField = profile.account_type === "club" ? "club_id" : "profile_id";
    const { data: sports } = await supabase
      .from(sportsTable)
      .select("*")
      .eq(idField, user.id);

    const isComplete = Array.isArray(sports) && sports.length > 0;
    set({ profile: profile as Profile, isProfileComplete: isComplete });

    // Initialise le sportsStore pour que le feed sache quels sports afficher
    if (isComplete) {
      await useSportsStore.getState().initialize(user.id, profile.account_type);
    }
  },
}));
