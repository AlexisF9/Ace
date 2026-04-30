import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { X, Plus, ImagePlus } from "lucide-react-native";
import { supabase, storagePathFromUrl } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import { useSportsStore } from "../../stores/sportsStore";
import { usePostImages } from "../../hooks/usePostImages";
import { usePostScore } from "../../hooks/usePostScore";
import { useTranslation } from "../../hooks/useTranslation";
import { Button } from "../ui/Button";
import { Match, Post, Sport } from "../../types";
import { colors } from "../../constants/theme";

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  post?: Post;
  onCreated: () => void;
  onUpdated: (patch: { content: string | null; image_urls: string[]; match?: Match; match_id?: string }) => void;
}

export function PostModal({ visible, onClose, post, onCreated, onUpdated }: PostModalProps) {
  const { session } = useAuthStore();
  const { visibleSports } = useSportsStore();
  const { t } = useTranslation();

  const isEditing = !!post;

  const [sport, setSport] = useState<Sport>((post?.sport ?? visibleSports[0] ?? "tennis") as Sport);
  const [content, setContent] = useState(post?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images = usePostImages();
  const score = usePostScore();

  useEffect(() => {
    if (visible) {
      setContent(post?.content ?? "");
      setSport((post?.sport ?? visibleSports[0] ?? "tennis") as Sport);
      setError(null);
      images.reset(post?.image_urls ?? []);
      score.reset(post?.match?.score.sets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, post?.id]);

  const hasContent = content.trim() !== "";
  const canPost = hasContent || score.hasScore || images.hasImages;

  const resetToOriginal = () => {
    setContent(post?.content ?? "");
    images.reset(post?.image_urls ?? []);
    score.reset(post?.match?.score.sets);
  };

  const handleClose = () => {
    images.reset();
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (isEditing && !canPost) {
      setError(t("post.emptyError"));
      resetToOriginal();
      return;
    }
    if (!canPost) return;

    setLoading(true);
    setError(null);

    try {
      const allImageUrls = await images.getFinalUrls(session.user.id);

      if (isEditing) {
        const { updatedMatch, updatedMatchId } = await score.submitScore(post, session.user.id);

        const { error: updateError } = await supabase
          .from("posts")
          .update({
            content: hasContent ? content.trim() : null,
            image_urls: allImageUrls.length > 0 ? allImageUrls : null,
            match_id: updatedMatchId ?? null,
          })
          .eq("id", post.id);

        if (updateError) throw updateError;

        const removedUrls = images.getRemovedUrls();
        if (removedUrls.length > 0) {
          await supabase.storage.from("post-images").remove(
            removedUrls.map((url) => storagePathFromUrl(url, "post-images")),
          );
        }

        onUpdated({ content: hasContent ? content.trim() : null, image_urls: allImageUrls, match: updatedMatch, match_id: updatedMatchId });
      } else {
        let matchId: string | undefined;

        if (score.hasScore) {
          const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert({
              player1_id: session.user.id,
              player2_id: session.user.id,
              sport,
              score: { sets: score.validSets.map((s) => ({ p1: parseInt(s.p1) || 0, p2: parseInt(s.p2) || 0 })) },
              validated: false,
            })
            .select()
            .single();
          if (matchError) throw matchError;
          matchId = match.id;
        }

        const { error: postError } = await supabase.from("posts").insert({
          author_id: session.user.id,
          type: "post",
          sport,
          ...(matchId ? { match_id: matchId } : {}),
          ...(hasContent ? { content: content.trim() } : {}),
          ...(allImageUrls.length > 0 ? { image_urls: allImageUrls } : {}),
        });

        if (postError) throw postError;
        onCreated();
      }

      handleClose();
    } catch (e: any) {
      setError(e.message ?? t("common.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-surface"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-display-bold text-ink text-2xl">
              {isEditing ? t("post.editTitle") : t("post.title")}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={22} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-white border border-ink-border rounded-md px-4 py-3 font-body text-sm text-ink min-h-[100px] mb-1"
            placeholder={t("post.messagePlaceholder")}
            placeholderTextColor="#8A8A8A"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text className="font-body text-xs text-ink-tertiary mb-5 text-right">
            {content.length}/500
          </Text>

          {!isEditing && visibleSports.length > 1 && (
            <View className="mb-5">
              <Text className="font-display-semi text-ink-secondary text-xs mb-2">
                {t("post.sport")}
              </Text>
              <View className="flex-row gap-2">
                {visibleSports.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSport(s)}
                    className={`flex-1 py-2.5 rounded-md items-center border-2 ${
                      sport === s ? "bg-orange border-orange" : "bg-white border-ink-border"
                    }`}
                  >
                    <Text className={`font-display-semi text-sm ${sport === s ? "text-white" : "text-ink-secondary"}`}>
                      {t(`common.${s}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {images.hasImages && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerClassName="gap-2"
            >
              {images.allUris.map((uri, i) => (
                <View key={i} className="w-20 h-20 rounded-md overflow-hidden">
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => images.removeImage(i)}
                    className="absolute top-1 right-1 bg-ink/60 rounded-full w-5 h-5 items-center justify-center"
                  >
                    <X size={10} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.canAddMore && (
                <TouchableOpacity
                  onPress={images.pickImages}
                  className="w-20 h-20 rounded-md border-2 border-dashed border-ink-border items-center justify-center"
                >
                  <Plus size={20} color="#8A8A8A" />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}

          {!images.hasImages && (
            <TouchableOpacity
              onPress={images.pickImages}
              className="flex-row items-center justify-center gap-2 border-2 border-dashed border-ink-border rounded-md py-3 mb-3"
            >
              <ImagePlus size={16} color="#8A8A8A" />
              <Text className="font-display-semi text-ink-secondary text-sm">
                {t("post.addPhoto")}
              </Text>
            </TouchableOpacity>
          )}

          {score.showScore ? (
            <View className="bg-white border border-ink-border rounded-md p-4 mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-display-semi text-ink text-sm">{t("post.sets")}</Text>
                <TouchableOpacity onPress={score.hideScore} className="p-1">
                  <X size={16} color="#8A8A8A" />
                </TouchableOpacity>
              </View>
              <View className="gap-2">
                {score.sets.map((set, i) => (
                  <View key={i} className="flex-row items-center gap-3">
                    <Text className="font-display-semi text-ink-tertiary text-xs w-10">
                      Set {i + 1}
                    </Text>
                    <TextInput
                      className="flex-1 bg-surface border border-ink-border rounded-md px-3 py-2.5 font-body text-sm text-ink text-center"
                      placeholder="6"
                      placeholderTextColor="#8A8A8A"
                      value={set.p1}
                      onChangeText={(v) => score.updateSet(i, "p1", v)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text className="font-body text-ink-tertiary">–</Text>
                    <TextInput
                      className="flex-1 bg-surface border border-ink-border rounded-md px-3 py-2.5 font-body text-sm text-ink text-center"
                      placeholder="4"
                      placeholderTextColor="#8A8A8A"
                      value={set.p2}
                      onChangeText={(v) => score.updateSet(i, "p2", v)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    {score.sets.length > 1 && (
                      <TouchableOpacity
                        onPress={() => score.removeSet(i)}
                        className="w-7 h-7 items-center justify-center"
                      >
                        <Text className="font-body text-ink-tertiary text-xl leading-none">×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              {score.sets.length < 5 && (
                <TouchableOpacity onPress={score.addSet} className="mt-3 items-center py-2">
                  <Text className="font-display-semi text-ink-secondary text-sm">
                    + {t("post.addSet")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => score.setShowScore(true)}
              className="flex-row items-center justify-center gap-2 border-2 border-dashed border-ink-border rounded-md py-3 mb-5"
            >
              <Plus size={16} color="#8A8A8A" />
              <Text className="font-display-semi text-ink-secondary text-sm">
                {t("post.addScore")}
              </Text>
            </TouchableOpacity>
          )}

          {error && (
            <Text className="font-body text-xs text-error mb-4 text-center">{error}</Text>
          )}

          <Button
            label={isEditing ? t("post.save") : t("post.publish")}
            onPress={handleSubmit}
            loading={loading}
            disabled={!isEditing && !canPost}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
