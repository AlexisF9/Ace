import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useFeed } from "../../hooks/useFeed";
import { FeedPost } from "../../components/feed/FeedPost";
import { PostModal } from "../../components/feed/PostModal";
import { FeedSportFilter } from "../../components/common/FeedSportFilter";
import { Post } from "../../types";
import { colors } from "../../constants/theme";
import { useTranslation } from "../../hooks/useTranslation";

function EmptyFeed() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Text className="text-3xl mb-3">🎾</Text>
      <Text className="font-display-semi text-ink-secondary text-base text-center mb-1">
        {t("feed.emptyTitle")}
      </Text>
      <Text className="font-body text-ink-tertiary text-sm text-center">
        {t("feed.emptySubtitle")}
      </Text>
    </View>
  );
}

function FooterLoader() {
  return (
    <View className="py-4 items-center">
      <ActivityIndicator size="small" color={colors.orange} />
    </View>
  );
}

export default function FeedScreen() {
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    loadMore,
    refresh,
    pullRefresh,
    deletePost,
    updatePost,
  } = useFeed();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const openCreate = useCallback(() => {
    setEditingPost(undefined);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((post: Post) => {
    setEditingPost(post);
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setEditingPost(undefined);
  }, []);

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <FeedPost
        post={item}
        onDelete={() => deletePost(item.id, item.image_urls, item.match_id)}
        onEdit={() => openEdit(item)}
      />
    ),
    [deletePost, openEdit],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <View className="bg-surface flex-1">
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <View className="flex-row items-center justify-between px-4">
              <Text className="font-display-bold text-ink text-2xl">
                {t("feed.title")}
              </Text>
              <TouchableOpacity
                onPress={openCreate}
                className="w-9 h-9 bg-orange rounded-pill items-center justify-center"
              >
                <Plus size={18} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <FeedSportFilter />
          </View>
        }
        ListEmptyComponent={<EmptyFeed />}
        ListFooterComponent={loadingMore ? <FooterLoader /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pullRefresh}
            tintColor={colors.orange}
            colors={[colors.orange]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? { flex: 1 } : { paddingBottom: 24 }
        }
      />

      <PostModal
        visible={modalVisible}
        onClose={handleClose}
        post={editingPost}
        onCreated={() => { handleClose(); refresh(); }}
        onUpdated={({ content, image_urls, match, match_id }) => {
          if (editingPost) updatePost(editingPost.id, { content: content ?? undefined, image_urls, match, match_id });
          handleClose();
        }}
      />
    </View>
  );
}
