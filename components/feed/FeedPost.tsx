import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart, MoreVertical, Pencil, Trash2 } from "lucide-react-native";
import { colors } from "../../constants/theme";
import { Post, Sport } from "../../types";
import { SportTag } from "../ui/SportTag";
import { ScorePost } from "./ScorePost";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Lang } from "../../stores/i18nStore";

function timeAgo(date: string, lang: Lang): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return lang === "fr" ? "À l'instant" : "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${lang === "fr" ? " h" : "h"}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}${lang === "fr" ? " j" : "d"}`;
  return new Date(date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

interface FeedPostProps {
  post: Post;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function FeedPost({ post, onDelete, onEdit }: FeedPostProps) {
  const { session } = useAuthStore();
  const { lang, t } = useTranslation();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const imageSliderWidth = screenWidth;

  const [reactions, setReactions] = useState(post.reactions_count ?? 0);
  const [reacted, setReacted] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const isOwner = session?.user.id === post.author_id;

  const imageHeightsRef = useRef<Record<number, number>>({});
  const currentIndexRef = useRef(0);
  const [imageHeight, setImageHeight] = useState(imageSliderWidth * 0.75);

  const author = post.author;
  const isClub = author?.account_type === "club";
  const initial = (author?.username ?? "?")[0].toUpperCase();
  const playerSports = (author as any)?.player_sports as
    | { sport: Sport; level: string }[]
    | undefined;
  const sportTagEntries =
    playerSports?.map((s) => ({ sport: s.sport, level: s.level })) ?? [];

  const hasImages = !!(post.image_urls && post.image_urls.length > 0);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("reactions")
      .select("post_id")
      .eq("post_id", post.id)
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setReacted(!!data));
  }, [post.id, session]);

  const handleReact = async () => {
    if (!session || reacting) return;
    setReacting(true);
    if (reacted) {
      setReacted(false);
      setReactions((n) => Math.max(0, n - 1));
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", session.user.id);
    } else {
      setReacted(true);
      setReactions((n) => n + 1);
      await supabase.from("reactions").upsert({
        post_id: post.id,
        user_id: session.user.id,
      });
    }
    setReacting(false);
  };

  const handleImageLoad = (index: number, nw: number, nh: number) => {
    const h = imageSliderWidth * (nh / nw);
    imageHeightsRef.current[index] = h;
    if (index === currentIndexRef.current) {
      setImageHeight(h);
    }
  };

  const handleSliderScrollEnd = (x: number) => {
    const index = Math.round(x / imageSliderWidth);
    currentIndexRef.current = index;
    setCurrentImageIndex(index);
    const h = imageHeightsRef.current[index];
    if (h) {
      setImageHeight(h);
    }
  };

  const handleAuthorPress = () => {
    if (!author) return;
    if (session?.user.id === author.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push(`/public-profil/${author.id}`);
    }
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    Alert.alert(t("feedPost.deleteTitle"), t("feedPost.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("feedPost.deleteConfirm"),
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View className="border-b border-ink-border pt-4 pb-8">
      {/* Header */}
      <View className="px-4 flex-row items-start justify-between mb-3">
        <TouchableOpacity
          onPress={handleAuthorPress}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 flex-1"
        >
          {author?.avatar_url ? (
            <Image
              source={{ uri: author.avatar_url }}
              className="w-14 h-14 rounded-pill"
              resizeMode="cover"
            />
          ) : (
            <View className="w-14 h-14 rounded-pill bg-orange-light items-center justify-center">
              <Text className="font-display-semi text-orange text-sm">
                {initial}
              </Text>
            </View>
          )}
          <View>
            <View className="flex-row items-center gap-2">
              <Text
                className="font-display-semi text-ink text-sm"
                numberOfLines={1}
              >
                @{author?.username ?? "..."}
              </Text>
              {isClub && (
                <View className="bg-surface px-1.5 py-0.5 rounded">
                  <Text className="font-display-semi text-ink-tertiary text-[10px]">
                    Club
                  </Text>
                </View>
              )}
              {!isClub && <SportTag entries={sportTagEntries} />}
            </View>
            <Text className="font-body text-ink-tertiary text-xs">
              {timeAgo(post.created_at, lang)}
            </Text>
          </View>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="p-1 mt-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={18} color={colors.inkTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu actions */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                onEdit?.();
              }}
              style={styles.menuItem}
            >
              <Pencil size={18} color={colors.ink} />
              <Text className="font-display-semi text-ink text-base">
                {t("feedPost.edit")}
              </Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              onPress={handleDeletePress}
              style={styles.menuItem}
            >
              <Trash2 size={18} color={colors.error} />
              <Text className="font-display-semi text-error text-base">
                {t("feedPost.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View className="flex flex-col gap-3">
        {/* Texte */}
        {post.content ? (
          <Text className="font-body text-ink-secondary text-sm leading-5 px-4">
            {post.content}
          </Text>
        ) : null}

        {post.match && <ScorePost match={post.match} />}

        {/* Images */}
        {hasImages && (
          <View style={{ height: imageHeight }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                handleSliderScrollEnd(e.nativeEvent.contentOffset.x)
              }
            >
              {post.image_urls!.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={{
                    width: imageSliderWidth,
                    height:
                      imageHeightsRef.current[i] ?? imageSliderWidth * 0.75,
                  }}
                  resizeMode="cover"
                  onLoad={(e) =>
                    handleImageLoad(
                      i,
                      e.nativeEvent.source.width,
                      e.nativeEvent.source.height,
                    )
                  }
                />
              ))}
            </ScrollView>
            {post.image_urls!.length > 1 && (
              <View style={styles.dotsContainer}>
                {post.image_urls!.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentImageIndex
                        ? styles.dotActive
                        : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Footer réactions */}
      <View className="flex-row items-center px-4 pt-3 gap-4">
        <TouchableOpacity
          onPress={handleReact}
          disabled={reacting}
          className="flex-row items-center gap-1.5"
        >
          <Heart
            size={18}
            color={reacted ? "#E0245E" : "#8A8A8A"}
            fill={reacted ? "#E0245E" : "transparent"}
          />
          {reactions > 0 && (
            <Text
              className={`font-display-semi text-xs ${reacted ? "text-[#E0245E]" : "text-ink-tertiary"}`}
            >
              {reactions}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 24,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
