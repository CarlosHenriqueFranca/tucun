import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/api";

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    level: number;
    isOnline: boolean;
  };
  caption: string;
  images: string[];
  videoUrl: string | null;
  fishType: string | null;
  spotName: string | null;
  location: { lat: number; lng: number } | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
  total: number;
}

type FeedTab = "discover" | "following";

async function fetchFeed({
  tab,
  pageParam,
}: {
  tab: FeedTab;
  pageParam: string | null;
}): Promise<FeedPage> {
  const params: Record<string, string> = { limit: "10" };
  if (pageParam) params.cursor = pageParam;
  if (tab === "following") params.following = "true";

  const { data } = await api.get<FeedPage>("/feed", { params });
  return data;
}

export function useFeed(tab: FeedTab = "discover") {
  return useInfiniteQuery({
    queryKey: ["feed", tab],
    queryFn: ({ pageParam }) =>
      fetchFeed({ tab, pageParam: pageParam as string | null }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
  });
}

export async function likePost(postId: string) {
  const { data } = await api.post(`/posts/${postId}/like`);
  return data;
}

export async function unlikePost(postId: string) {
  const { data } = await api.delete(`/posts/${postId}/like`);
  return data;
}
