import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";

const MAX_IMAGES = 5;

export function usePostImages() {
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
  const originalUrlsRef = useRef<string[]>([]);

  const totalCount = existingUrls.length + newImageUris.length;

  const reset = (initialUrls: string[] = []) => {
    setExistingUrls(initialUrls);
    setNewImageUris([]);
    originalUrlsRef.current = initialUrls;
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const remaining = MAX_IMAGES - totalCount;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewImageUris((prev) =>
        [...prev, ...result.assets.map((a) => a.uri)].slice(
          0,
          MAX_IMAGES - existingUrls.length,
        ),
      );
    }
  };

  const removeImage = (index: number) => {
    if (index < existingUrls.length) {
      setExistingUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImageUris((prev) => prev.filter((_, i) => i !== index - existingUrls.length));
    }
  };

  const getFinalUrls = async (userId: string): Promise<string[]> => {
    if (newImageUris.length === 0) return existingUrls;
    const newUrls = await Promise.all(newImageUris.map((uri) => uploadImage(uri, userId)));
    return [...existingUrls, ...newUrls];
  };

  const getRemovedUrls = (): string[] =>
    originalUrlsRef.current.filter((url) => !existingUrls.includes(url));

  return {
    allUris: [...existingUrls, ...newImageUris],
    hasImages: totalCount > 0,
    canAddMore: totalCount < MAX_IMAGES,
    pickImages,
    removeImage,
    getFinalUrls,
    getRemovedUrls,
    reset,
  };
}

async function uploadImage(uri: string, userId: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
  );

  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: "base64",
  });

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, decode(base64), { contentType: "image/jpeg" });

  if (error) throw error;

  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}
