import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProfilePost } from '@/components/profile/PostCard';

export interface FirestorePost {
  id: string;
  authorId: string;
  type: 'photo' | 'video' | 'text';
  mediaUrl?: string;
  caption: string;
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
  visibility: 'public' | 'members';
}

interface UserPostsState {
  posts: ProfilePost[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
}

const [PostsProviderInternal, usePostsInternal] = createContextHook(() => {
  const [userPosts, setUserPosts] = useState<{ [userId: string]: UserPostsState }>({});

  const fetchUserPosts = useCallback(
    async (userId: string, refresh: boolean = false) => {
      if (!db) {
        console.warn('[Posts] Firestore not initialized');
        return;
      }

      const currentState = userPosts[userId];
      
      if (!refresh && currentState?.loading) {
        return;
      }

      try {
        console.log('[Posts] Fetching posts for user:', userId);

        setUserPosts((prev) => ({
          ...prev,
          [userId]: {
            posts: refresh ? [] : prev[userId]?.posts || [],
            loading: !refresh,
            refreshing: refresh,
            hasMore: prev[userId]?.hasMore || true,
            lastDoc: refresh ? null : prev[userId]?.lastDoc || null,
          },
        }));

        const postsQuery = refresh || !currentState?.lastDoc
          ? query(
              collection(db, 'posts'),
              where('authorId', '==', userId),
              orderBy('createdAt', 'desc'),
              limit(18)
            )
          : query(
              collection(db, 'posts'),
              where('authorId', '==', userId),
              orderBy('createdAt', 'desc'),
              startAfter(currentState.lastDoc),
              limit(18)
            );

        const snapshot = await getDocs(postsQuery);

        console.log('[Posts] Fetched posts count:', snapshot.docs.length);

        const fetchedPosts: ProfilePost[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<FirestorePost, 'id'>;
          return {
            id: doc.id,
            authorId: data.authorId,
            type: data.type,
            mediaUrl: data.mediaUrl,
            caption: data.caption,
            createdAt: data.createdAt?.toDate() || new Date(),
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
            visibility: data.visibility || 'public',
          };
        });

        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
        const hasMore = snapshot.docs.length === 18;

        setUserPosts((prev) => ({
          ...prev,
          [userId]: {
            posts: refresh
              ? fetchedPosts
              : [...(prev[userId]?.posts || []), ...fetchedPosts],
            loading: false,
            refreshing: false,
            hasMore,
            lastDoc: lastVisible,
          },
        }));
      } catch (error) {
        console.error('[Posts] Error fetching posts:', error);
        setUserPosts((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            loading: false,
            refreshing: false,
          },
        }));
      }
    },
    [userPosts]
  );

  const refreshUserPosts = useCallback(
    (userId: string) => {
      return fetchUserPosts(userId, true);
    },
    [fetchUserPosts]
  );

  const loadMorePosts = useCallback(
    (userId: string) => {
      const state = userPosts[userId];
      if (state && !state.loading && state.hasMore) {
        return fetchUserPosts(userId, false);
      }
    },
    [fetchUserPosts, userPosts]
  );

  const getUserPosts = useCallback(
    (userId: string): UserPostsState => {
      return (
        userPosts[userId] || {
          posts: [],
          loading: false,
          refreshing: false,
          hasMore: true,
          lastDoc: null,
        }
      );
    },
    [userPosts]
  );

  return useMemo(
    () => ({
      fetchUserPosts,
      refreshUserPosts,
      loadMorePosts,
      getUserPosts,
    }),
    [fetchUserPosts, refreshUserPosts, loadMorePosts, getUserPosts]
  );
});

export const PostsProvider = PostsProviderInternal;

export const usePosts = () => {
  const context = usePostsInternal();
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};

export const useUserPosts = (userId: string) => {
  const { fetchUserPosts, refreshUserPosts, loadMorePosts, getUserPosts } =
    usePosts();
  const state = getUserPosts(userId);

  useEffect(() => {
    if (!state.posts.length && !state.loading) {
      fetchUserPosts(userId);
    }
  }, [userId, fetchUserPosts, state.posts.length, state.loading]);

  const handleRefresh = useCallback(() => {
    refreshUserPosts(userId);
  }, [refreshUserPosts, userId]);

  const handleLoadMore = useCallback(() => {
    loadMorePosts(userId);
  }, [loadMorePosts, userId]);

  return {
    posts: state.posts,
    loading: state.loading,
    refreshing: state.refreshing,
    hasMore: state.hasMore,
    onRefresh: handleRefresh,
    onLoadMore: handleLoadMore,
  };
};
