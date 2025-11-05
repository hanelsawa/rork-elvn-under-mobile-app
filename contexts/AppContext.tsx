import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { currentUser } from '@/mocks/users';
import { posts as initialPosts } from '@/mocks/posts';
import { giveaways as initialGiveaways } from '@/mocks/giveaways';
import type { Post } from '@/mocks/posts';
import type { Giveaway } from '@/mocks/giveaways';

export interface CoinAnimationData {
  id: string;
  amount: number;
  x: number;
  y: number;
}

const [AppProviderInternal, useAppInternal] = createContextHook(() => {
  const [user, setUser] = useState(currentUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [giveaways, setGiveaways] = useState<Giveaway[]>(initialGiveaways);
  const [notifications] = useState<number>(3);
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimationData[]>([]);

  const updateChips = useCallback((amount: number, position?: { x: number; y: number }) => {
    setUser(prev => ({
      ...prev,
      chips: prev.chips + amount,
    }));
    
    if (amount > 0 && position) {
      const animationId = `coin-${Date.now()}`;
      setCoinAnimations(prev => [
        ...prev,
        {
          id: animationId,
          amount,
          x: position.x,
          y: position.y,
        },
      ]);
    }
  }, []);

  const removeCoinAnimation = useCallback((id: string) => {
    setCoinAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: `c${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
    updateChips(10);
  }, [user, updateChips]);

  const enterGiveaway = useCallback((giveawayId: string, entryCost: number) => {
    if (user.chips >= entryCost) {
      setGiveaways(prev =>
        prev.map(giveaway => {
          if (giveaway.id === giveawayId) {
            return {
              ...giveaway,
              totalEntries: giveaway.totalEntries + 1,
            };
          }
          return giveaway;
        })
      );
      updateChips(-entryCost);
      return true;
    }
    return false;
  }, [user.chips, updateChips]);

  return useMemo(
    () => ({
      user,
      posts,
      giveaways,
      notifications,
      coinAnimations,
      updateChips,
      toggleLike,
      addComment,
      enterGiveaway,
      removeCoinAnimation,
    }),
    [user, posts, giveaways, notifications, coinAnimations, updateChips, toggleLike, addComment, enterGiveaway, removeCoinAnimation]
  );
});

export const AppProvider = AppProviderInternal;

export const useApp = () => {
  const context = useAppInternal();
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
