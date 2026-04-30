import { create } from "zustand";
import { Sport, TennisLevel, PadelLevel } from "../types";

export type AccountType = "player" | "club" | null;

export interface SportEntry {
  sport: Sport;
  level: string;
}

interface PlayerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  city: string;
  avatarUri: string | null;
  sports: SportEntry[];
  // preferences
  favoriteSurface: string | null;
  availability: string[]; // ['mon', 'tue', ...]
}

interface ClubData {
  email: string;
  password: string;
  clubName: string;
  logoUri: string | null;
  coverUri: string | null;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  website: string;
  sports: Sport[];
  tennisCourts: number;
  tennisSurfaces: string[];
  padelCourts: number;
  padelSurfaces: string[];
  description: string;
  openingHours: Record<string, { open: string; close: string }>;
}

interface RegisterState {
  accountType: AccountType;
  player: PlayerData;
  club: ClubData;

  setAccountType: (type: AccountType) => void;
  updatePlayer: (data: Partial<PlayerData>) => void;
  updateClub: (data: Partial<ClubData>) => void;
  reset: () => void;
}

const defaultPlayer: PlayerData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  username: "",
  city: "",
  avatarUri: null,
  sports: [],
  favoriteSurface: null,
  availability: [],
};

const defaultClub: ClubData = {
  email: "",
  password: "",
  clubName: "",
  logoUri: null,
  coverUri: null,
  address: "",
  postalCode: "",
  city: "",
  phone: "",
  website: "",
  sports: [],
  tennisCourts: 0,
  tennisSurfaces: [],
  padelCourts: 0,
  padelSurfaces: [],
  description: "",
  openingHours: {},
};

export const useRegisterStore = create<RegisterState>((set) => ({
  accountType: null,
  player: { ...defaultPlayer },
  club: { ...defaultClub },

  setAccountType: (accountType) => set({ accountType }),
  updatePlayer: (data) =>
    set((s) => ({ player: { ...s.player, ...data } })),
  updateClub: (data) =>
    set((s) => ({ club: { ...s.club, ...data } })),
  reset: () =>
    set({
      accountType: null,
      player: { ...defaultPlayer },
      club: { ...defaultClub },
    }),
}));
