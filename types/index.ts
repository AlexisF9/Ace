export type Sport = "tennis" | "padel";
export type AccountType = "player" | "club";
export type Surface = "clay" | "hard" | "grass" | "indoor";
export type PostType =
  | "post"
  | "search_partner"
  | "club_announcement";
export type UserRole = "user" | "admin" | "moderator";

export type TennisLevel =
  | "NC"
  | "40"
  | "30/2"
  | "30/1"
  | "30"
  | "15/2"
  | "15/1"
  | "15"
  | "5/6"
  | "4/6"
  | "3/6"
  | "2/6"
  | "1/6"
  | "0";

export type PadelLevel =
  | "P25"
  | "P50"
  | "P100"
  | "P200"
  | "P250"
  | "P300"
  | "P500"
  | "P1000";

export interface Profile {
  id: string;
  account_type: AccountType;
  username: string;
  avatar_url?: string;
  city?: string;
  role: UserRole;
  created_at: string;
}

export interface PlayerSport {
  sport: Sport;
  level: string;
  hidden: boolean;
}

export interface PlayerProfile extends Profile {
  account_type: "player";
  first_name: string;
  last_name: string;
  sports: PlayerSport[];
}

export interface ClubProfile extends Profile {
  account_type: "club";
  club_name: string;
  cover_url?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  sports: Sport[];
  verified: boolean;
  members_count?: number;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  sport: Sport;
  score: { sets: Array<{ p1: number; p2: number }> };
  surface?: Surface;
  validated: boolean;
  played_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  match_id?: string;
  type: PostType;
  content?: string;
  image_urls?: string[];
  sport: Sport;
  created_at: string;
  author?: PlayerProfile | ClubProfile;
  match?: Match;
  reactions_count?: number;
}
