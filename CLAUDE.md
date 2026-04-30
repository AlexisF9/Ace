# Ace Mobile — Documentation & Architecture

## Vue d'ensemble

Application mobile multi-sport (tennis + padel) combinant réseau social et recherche de partenaires. Construite avec Expo SDK 54, Expo Router et NativeWind v4. Backend Supabase partagé avec `ace-backoffice`.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo SDK | ~54 | Runtime & outils |
| Expo Router | ~6 | Navigation file-based |
| NativeWind | ^4.2.3 | Styling (Tailwind pour RN) |
| Tailwind CSS | ^3.4 | Configuration styles |
| Zustand | ^5 | State management |
| Supabase JS | ^2 | Backend (auth, BDD, storage) |
| TypeScript | ~5.9 | Typage |

---

## Structure des fichiers

```
ace-mobile/
├── app/                        # Routes Expo Router
│   ├── _layout.tsx             # Root layout — AuthGate + fonts
│   ├── (auth)/                 # Groupe non-protégé
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Page d'accueil (non connecté) — background photo + CTA
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── register/
│   │       ├── index.tsx       # Méthode d'inscription
│   │       ├── type.tsx        # Choix joueur / club
│   │       ├── player/
│   │       │   ├── credentials.tsx   # Étape 1 — email/mdp
│   │       │   ├── profile.tsx       # Étape 2 — prénom/nom/username/ville
│   │       │   ├── sports.tsx        # Étape 3 — sports & niveaux
│   │       │   └── preferences.tsx   # Étape 4 — surface/dispo + SAVE
│   │       └── club/
│   │           ├── credentials.tsx
│   │           ├── identity.tsx
│   │           ├── location.tsx
│   │           ├── sports.tsx
│   │           └── presentation.tsx
│   └── (tabs)/                 # Groupe protégé (connecté uniquement)
│       ├── _layout.tsx         # 3 tabs : Feed / Publier / Profil + SportsInit
│       ├── index.tsx           # Feed (FlatList, filtres, realtime, pagination)
│       ├── post.tsx            # Création de post (score ou texte)
│       └── profile.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── SportTag.tsx        # Badge coloré sport (tennis/padel)
│   ├── common/
│   │   └── FeedSportFilter.tsx # Onglets Tous / Tennis / Padel
│   ├── feed/
│   │   ├── FeedPost.tsx        # Card post avec auteur, contenu, réaction
│   │   └── ScorePost.tsx       # Affichage sets d'un score
│   └── register/
│       ├── StepIndicator.tsx
│       └── SportSelector.tsx
├── constants/
│   └── theme.ts                # Couleurs, typo, spacing, border-radius
├── hooks/
│   ├── useAuth.ts              # useProtectedRoute, useAuth
│   └── useFeed.ts              # Fetch paginé + Realtime Supabase
├── lib/
│   └── supabase.ts             # Client Supabase (SecureStore sur mobile)
├── stores/
│   ├── authStore.ts            # Session, profil, isProfileComplete
│   ├── registerStore.ts        # Données temporaires du tunnel d'inscription
│   └── sportsStore.ts          # activeSports, hiddenSport, visibleSports, feedFilter
├── types/
│   └── index.ts                # Types partagés (Profile, Sport, Post…)
├── global.css                  # @tailwind base/components/utilities
├── global.d.ts                 # Déclaration module *.css pour TS
├── nativewind-env.d.ts
└── tsconfig.json
```

---

## Navigation & Authentification

### AuthGate (`app/_layout.tsx`)

Composant monté à la racine qui gère toutes les redirections. Logique simple et sans ambiguité :

```
Non connecté + hors (auth)  →  /(auth)/        ← page d'accueil welcome
Connecté + dans (auth)      →  /(tabs)
Connecté + dans (tabs)      →  reste en place
Non connecté + dans (auth)  →  reste en place (flux login/register)
```

**Règle importante** : `isProfileComplete` n'est PAS utilisé dans l'AuthGate. Il ne sert qu'à des fins d'affichage dans l'app (banière, accès à des features). Le tunnel d'inscription n'est accessible que via navigation explicite, jamais via redirect automatique.

### `authStore.ts` — Zustand

```ts
session: Session | null
profile: Profile | null
isLoading: boolean
isProfileComplete: boolean  // true si player_sports / club_sports non vide

initialize()      // appelé au démarrage, charge session + profil avant SplashScreen.hide
signIn()          // login + refreshProfile
signUp()          // création compte (sans refreshProfile — données pas encore en base)
signOut()
refreshProfile()  // recharge profile + sports depuis Supabase
```

**À retenir** :
- `initialize()` est appelé dans `RootLayout` et cache le SplashScreen après résolution → aucun flash d'écran
- `onAuthStateChange` synchronise uniquement la session, ne relance PAS `refreshProfile` (évite les lectures stales pendant l'inscription)
- `refreshProfile()` est appelé explicitement dans `initialize` et `signIn`

### Tunnel d'inscription joueur

```
register/index → register/type → player/credentials → player/profile
  → player/sports → player/preferences (SAVE + signUp + router.replace("/(tabs)"))
```

La sauvegarde en base se fait entièrement dans `preferences.tsx` au moment du submit final :
1. `signUp()` — crée l'auth user
2. Upload avatar → bucket `avatars` → URL sauvegardée dans `accounts.avatar_url`
3. `accounts.upsert` + `player_accounts.upsert`
4. `player_sports.upsert`
5. `refreshProfile()` — met à jour le store
6. `router.replace("/(tabs)")`

### Tunnel d'inscription club

```
register/index → register/type → club/credentials → club/identity (logo + cover)
  → club/location → club/sports → club/presentation (SAVE)
```

La sauvegarde en base se fait entièrement dans `presentation.tsx` :
1. `signUp()` — crée l'auth user
2. Upload logo → bucket `avatars` → URL sauvegardée dans `accounts.avatar_url`
3. Upload cover → bucket `covers` → URL sauvegardée dans `club_accounts.cover_url`
4. `accounts.upsert` + `club_accounts.upsert`
5. `club_sports.upsert`
6. `refreshProfile()` — met à jour le store
7. `router.replace("/(tabs)")`

---

## Design System

> Source de vérité : `new_design_system.md` à la racine du projet.

### Couleurs (`constants/theme.ts` + `tailwind.config.js`)

#### Orange — actions primaires (clay, Roland Garros, tennis)
| Token JS | Classe Tailwind | Valeur | Usage |
|---|---|---|---|
| `colors.orange` | `bg-orange` / `text-orange` | `#C4501A` | CTA principal, prix, sélections actives |
| `colors.orangeLight` | `bg-orange-light` | `#F5DDD5` | Fond badge orange, avatar, card sélectionnée |
| `colors.orangeMid` | `bg-orange-mid` | `#E8987A` | États hover/pressed |
| `colors.orangeDark` | `text-orange-dark` | `#8C3610` | Texte sur fond orange clair |

#### Noir & Blanc — structure
| Token JS | Classe Tailwind | Valeur | Usage |
|---|---|---|---|
| `colors.ink` | `bg-ink` / `text-ink` | `#0C0C0C` | Texte principal, fonds sombres |
| `colors.inkSecondary` | `text-ink-secondary` | `#3A3A3A` | Texte body |
| `colors.inkTertiary` | `text-ink-tertiary` | `#8A8A8A` | Texte muted, placeholders |
| `colors.inkBorder` | `border-ink-border` | `#D0D0D0` | Bordures, séparateurs |
| `colors.white` | `bg-white` | `#FFFFFF` | Fonds de cards, surfaces |
| `colors.surface` | `bg-surface` | `#F7F7F7` | Fond de page, inputs, zones grises |
| `colors.error` | `text-error` / `border-error` | `#D92B2B` | Erreurs de formulaire |

### Typographie

**Police unique : Outfit** — 5 graisses chargées via `@expo-google-fonts/outfit`.

| Classe NativeWind | Font | Usage |
|---|---|---|
| `font-display` | Outfit 700 Bold | Titres, boutons |
| `font-display-bold` | Outfit 800 ExtraBold | Grands titres héros |
| `font-display-semi` | Outfit 600 SemiBold | Labels, sous-titres |
| `font-body` | Outfit 400 Regular | Corps de texte |
| `font-body-medium` | Outfit 500 Medium | Corps accentué |

**Tailles courantes** : `text-2xl` (titres écran), `text-base` (corps), `text-sm` (secondaire), `text-xs` (labels/captions)

### Espacements (`constants/theme.ts`)

| Token | Valeur |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `xxl` | 32px |
| `xxxl` | 48px |

**Padding horizontal de page** : 16px (`px-4`).

### Border radius

| Token | Valeur | Usage |
|---|---|---|
| `rounded-xs` | 6px | Petits éléments discrets |
| `rounded-sm` | 10px | Boutons, inputs, time slots |
| `rounded-md` | 14px | Boutons larges (CTA) |
| `rounded-lg` | 20px | Cards, modals |
| `rounded-pill` | 9999px | Badges, chips, avatars |

---

## Composants UI

### `Button` (`components/ui/Button.tsx`)

```tsx
<Button
  label="Se connecter"
  onPress={handlePress}
  variant="primary"   // "primary" | "secondary" | "outline-orange" | "ghost" | "dark" | "outline-white"
  loading={false}
  disabled={false}
  fullWidth={true}    // false → self-start avec padding horizontal
/>
```

| Variant | Fond | Texte | Usage |
|---|---|---|---|
| `primary` | orange | blanc | CTA principal |
| `secondary` | orange | blanc | Action secondaire |
| `outline-orange` | transparent | orange | Action annulable |
| `ghost` | surface + border | ink | Actions neutres |
| `dark` | ink | blanc | Sur fonds clairs importants |
| `outline-white` | transparent | blanc | Sur fonds sombres (welcome screen) |

- Spinner couleur adaptée au variant en `loading`
- Opacité 40% quand `disabled` ou `loading`

### `Input` (`components/ui/Input.tsx`)

```tsx
<Input
  label="Email *"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  placeholder="ton@email.com"
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

- Bordure rouge + message d'erreur sous le champ si `error` défini
- Placeholder color : `inkTertiary` (`#8A8A8A`)
- Étend `TextInputProps` de React Native

### `StepIndicator` (`components/register/StepIndicator.tsx`)

```tsx
<StepIndicator current={2} total={4} />
```

Barre de progression en segments orange pour les tunnels multi-étapes.

### `SportSelector` (`components/register/SportSelector.tsx`)

```tsx
<SportSelector value={sports} onChange={setSports} />
// value: SportEntry[] — { sport: "tennis"|"padel", level: string }
```

Cards Tennis + Padel avec sélection du niveau (niveaux FFT pour tennis, P25→P1000 pour padel).

---

## Types (`types/index.ts`)

```ts
Sport = "tennis" | "padel"
AccountType = "player" | "club"
Surface = "clay" | "hard" | "grass" | "indoor"
TennisLevel = "NC" | "40" | "30/2" | "30/1" | "30" | "15/2" | "15/1" | "15" | "5/6" | "4/6" | "3/6" | "2/6" | "1/6" | "0"
PadelLevel = "P25" | "P50" | "P100" | "P200" | "P250" | "P300" | "P500" | "P1000"

Profile         — champs communs (id, account_type, username, avatar_url, city, role) → table `accounts`
PlayerProfile   — extends Profile + first_name, last_name, sports → table `player_accounts`
ClubProfile     — extends Profile + club_name, cover_url, verified… → table `club_accounts`
Match           — id, player1_id, player2_id, sport, score, surface, validated
Post            — id, author_id, type, content, sport, author?, match?
```

---

## Supabase — Tables principales

```
auth.users
    └── accounts          ← base commune (id, account_type, username, avatar_url, city, role)
            ├── player_accounts   ← joueur (first_name, last_name)
            └── club_accounts     ← club (club_name, cover_url, address, opening_hours…)
```

| Table | Description |
|---|---|
| `accounts` | Base commune joueur/club (account_type, username, avatar_url, city) |
| `player_accounts` | Détails joueur (first_name, last_name) |
| `club_accounts` | Détails club (club_name, cover_url, address, opening_hours…) |
| `player_sports` | Sports d'un joueur (profile_id, sport, level, hidden) |
| `club_sports` | Sports d'un club (club_id, sport) |
| `matches` | Scores et matchs (player1_id, player2_id nullable si compte supprimé) |
| `posts` | Publications du feed (supprimés en cascade si auteur supprimé) |
| `reactions` | Bravos sur les posts (supprimées en cascade si auteur supprimé) |

**Champs de jointure** :
- `player_accounts.profile_id` = `accounts.id`
- `club_accounts.profile_id` = `accounts.id`
- `player_sports.profile_id` = `accounts.id`
- `club_sports.club_id` = `accounts.id`

**Comportement à la suppression** :
- Suppression `auth.users` → cascade sur `accounts` → cascade sur toutes les tables enfants
- `posts.author_id` → `ON DELETE CASCADE` (post supprimé avec l'auteur)
- `reactions.user_id` → `ON DELETE CASCADE` (réaction supprimée avec l'auteur)
- `matches.player1_id / player2_id` → `ON DELETE SET NULL` (match conservé, joueur anonymisé)

### Migrations SQL (`supabase/`)

| Fichier | Rôle |
|---|---|
| `000_drop_all.sql` | ⚠️ Supprime toutes les tables — à exécuter sur base vierge |
| `001_initial.sql` | Crée accounts, player_accounts, club_accounts, player_sports, club_sports + RLS + trigger |
| `posts_matches.sql` | Crée matches, posts, reactions + RLS |
| `002_fk_cascade.sql` | Corrige les FK ON DELETE pour la suppression en cascade |

**Ordre d'exécution** : `000` → `001` → `posts_matches` → `002`

---

## Feed & Posts (Phase 3)

### `sportsStore.ts`

```ts
activeSports: Sport[]       // tous les sports du profil
hiddenSport: Sport | null   // sport masqué dans le feed
feedFilter: Sport | null    // filtre temporaire (Tous / Tennis / Padel)
visibleSports: Sport[]      // activeSports - hiddenSport (dérivé)

initialize(userId, accountType)  // charge depuis player_sports / club_sports
setHiddenSport(sport, userId)    // masque un sport + sync Supabase
setFeedFilter(sport | null)      // filtre du feed (en mémoire seulement)
reset()                          // appelé au sign out
```

Initialisé dans `app/(tabs)/_layout.tsx` via composant `SportsInit` (se lance quand session + profile sont dispo).

### `useFeed` hook

- Pagination `PAGE_SIZE = 20` via `.range(from, from + PAGE_SIZE - 1)`
- Filtre sport : `feedFilter ? [feedFilter] : ALL_SPORTS.filter(s => s !== hiddenSport)`
  - Par défaut tous les sports sont visibles (tennis + padel), indépendamment des sports du profil
  - `hiddenSport` est le seul moyen de réduire le feed (toggle dans la page profil)
- Realtime : channel `feed-realtime` sur `INSERT` dans `posts`, rafraîchit depuis le début
- `useFocusEffect` dans `FeedScreen` : rafraîchit le feed à chaque fois que l'onglet devient actif
- Retourne : `{ posts, loading, loadingMore, loadMore, refresh }`

### Post types

| Type | Données | Affichage |
|---|---|---|
| `score` | `match_id` → `matches` (score.sets[]) | `ScorePost` — sets colorés |
| `text` | `content` | Texte simple |

### Réactions

- Type `bravo` — upsert dans la table `reactions` (post_id, user_id, type)
- État local optimiste dans `FeedPost` (pas de re-fetch)

---

## Conventions de code

- **Styling** : NativeWind uniquement, pas de `StyleSheet`. Classes Tailwind dans `className`.
- **Polices** : toujours via les classes `font-display`, `font-body`, etc. (toutes Outfit) — jamais hardcodé.
- **Couleurs** : toujours via les tokens Tailwind (`text-orange`, `bg-surface`, `border-ink-border`). Pas de hex inline.
- **Fond d'écran** : `bg-surface` par défaut sur tous les écrans.
- **Navigation** : `router.replace` pour les redirections auth, `router.push` pour la navigation forward dans les tunnels.
- **Stores** : Zustand sans `immer`. Mutations simples via `set()`.
- **Erreurs Supabase** : toujours vérifier `error` avant d'utiliser `data`.
- **Icônes** : `lucide-react-native` (déjà installé).
- **Internationalisation** : tout texte visible par l'utilisateur doit passer par `t()` du hook `useTranslation`. Ajouter la clé dans `i18n/fr.json` ET `i18n/en.json` simultanément. Ne jamais hardcoder une chaîne UI dans un composant.

---

## Commandes

```bash
npm start          # Expo Go / dev
npm run android    # Android
npm run ios        # iOS
```

Variables d'environnement requises dans `.env` :
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Maintenance de ce fichier

**Ce fichier doit être mis à jour après chaque modification significative du projet.**

Mettre à jour lorsque :
- Un nouvel écran est ajouté ou supprimé → mettre à jour la structure des fichiers
- La logique de navigation ou d'AuthGate change → mettre à jour la section Navigation
- Un nouveau composant UI est créé ou un composant existant est modifié (variants, props) → mettre à jour la section Composants UI
- Un nouveau type, store ou table Supabase est ajouté → mettre à jour les sections correspondantes
- Une convention de code évolue → mettre à jour la section Conventions
