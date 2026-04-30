import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// SecureStore est limité à 2048 bytes par clé.
// Ce storage adapter découpe les valeurs trop grandes en plusieurs clés.
const CHUNK_SIZE = 1800;

const LargeSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      const n = parseInt(chunkCount, 10);
      const chunks: string[] = [];
      for (let i = 0; i < n; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      return chunks.join("");
    }
    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length > CHUNK_SIZE) {
      const chunks = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
      for (let i = 0; i < chunks; i++) {
        await SecureStore.setItemAsync(
          `${key}_chunk_${i}`,
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        );
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      const n = parseInt(chunkCount, 10);
      await SecureStore.deleteItemAsync(`${key}_chunks`);
      for (let i = 0; i < n; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Sur web : session détectée depuis l'URL (OAuth redirect) + localStorage
// Sur mobile : session stockée dans SecureStore avec support des grandes valeurs
const authConfig =
  Platform.OS === "web"
    ? { detectSessionInUrl: true }
    : { storage: LargeSecureStoreAdapter, detectSessionInUrl: false };

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: authConfig },
);

export function storagePathFromUrl(url: string, bucket: string): string {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : url;
}
