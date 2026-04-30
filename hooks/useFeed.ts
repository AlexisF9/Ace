import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, storagePathFromUrl } from "../lib/supabase";
import { useSportsStore } from "../stores/sportsStore";
import { Post, Sport } from "../types";

const PAGE_SIZE = 20;
const ALL_SPORTS: Sport[] = ["tennis", "padel"];

export function useFeed() {
  const { hiddenSport, feedFilter } = useSportsStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasDataRef = useRef(false);

  const sportsToFilter = feedFilter
    ? [feedFilter]
    : ALL_SPORTS.filter((s) => s !== hiddenSport);
  const filterKey = sportsToFilter.join(",");

  const fetchPosts = useCallback(
    async (from = 0, replace = true) => {
      if (sportsToFilter.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      if (from === 0 && !hasDataRef.current) setLoading(true);
      else if (from > 0) setLoadingMore(true);

      const { data, error } = await supabase
        .from("posts")
        .select(
          `id, author_id, match_id, type, content, image_urls, sport, created_at,
           author:accounts!author_id(id, username, avatar_url, account_type, player_sports(sport, level)),
           match:matches!match_id(id, sport, score, surface, validated, played_at, player1_id, player2_id),
           reactions(count)`
        )
        .in("sport", sportsToFilter)
        .in("type", ["post", "search_partner"])
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (!error && data) {
        const mapped = data.map((p: any) => ({
          ...p,
          author: p.author ?? undefined,
          match: p.match ?? undefined,
          reactions_count: (p.reactions?.[0] as any)?.count ?? 0,
          reactions: undefined,
        })) as Post[];

        setPosts((prev) => (replace ? mapped : [...prev, ...mapped]));
        setHasMore(data.length === PAGE_SIZE);
        hasDataRef.current = true;
      }

      setLoading(false);
      setLoadingMore(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey]
  );

  useEffect(() => {
    fetchPosts(0, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && posts.length > 0) {
      fetchPosts(posts.length, false);
    }
  }, [loadingMore, hasMore, posts.length, fetchPosts]);

  // Refresh silencieux (focus onglet, realtime)
  const refresh = useCallback(() => fetchPosts(0, true), [fetchPosts]);

  // Refresh manuel avec indicateur pull-to-refresh
  const pullRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(0, true);
    setRefreshing(false);
  }, [fetchPosts]);

  const deletePost = useCallback(async (id: string, imageUrls?: string[], matchId?: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("posts").delete().eq("id", id);
    if (matchId) {
      await supabase.from("matches").delete().eq("id", matchId);
    }
    if (imageUrls?.length) {
      const paths = imageUrls.map((url) => storagePathFromUrl(url, "post-images"));
      await supabase.storage.from("post-images").remove(paths);
    }
  }, []);

  const updatePost = useCallback((id: string, patch: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  return { posts, loading, refreshing, loadingMore, loadMore, refresh, pullRefresh, deletePost, updatePost };
}
