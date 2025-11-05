import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import PostCard, { ProfilePost } from './PostCard';
import Colors from '@/constants/colors';
import { useCallback, useState } from 'react';

interface PostGridProps {
  posts: ProfilePost[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}

export default function PostGrid({
  posts,
  loading,
  refreshing,
  hasMore,
  onRefresh,
  onLoadMore,
}: PostGridProps) {
  const router = useRouter();
  const [variant] = useState<'grid' | 'list'>('grid');

  const handlePostPress = useCallback((postId: string) => {
    router.push(`/post/${postId}` as any);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ProfilePost }) => (
      <PostCard
        post={item}
        onPress={() => handlePostPress(item.id)}
        variant={variant}
      />
    ),
    [handlePostPress, variant]
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Image size={48} color={Colors.gold} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Share your golf moments on the Hub
        </Text>
      </View>
    );
  }, [loading]);

  if (variant === 'grid') {
    const FlashListComponent = FlashList as any;
    return (
      <View style={styles.container}>
        <FlashListComponent
          data={posts}
          renderItem={renderItem}
          estimatedItemSize={120}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  const FlashListComponent = FlashList as any;
  return (
    <View style={styles.container}>
      <FlashListComponent
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gridContainer: {
    padding: 16,
    gap: 8,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
