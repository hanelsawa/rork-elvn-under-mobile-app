import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Trophy, Award, Users, Calendar, TrendingUp, Target, MessageCircle, UserPlus, UserMinus, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState, useCallback, useEffect } from 'react';
import PostGrid from '@/components/profile/PostGrid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserPosts } from '@/contexts/PostsContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User } from '@/mocks/users';
import { useFirebase } from '@/contexts/FirebaseContext';

type TabType = 'overview' | 'posts';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const firebaseContext = useFirebase();

  const {
    posts,
    loading: postsLoading,
    refreshing,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useUserPosts(userId || '');

  useEffect(() => {
    if (userId === currentUser.id) {
      router.replace('/profile');
      return;
    }

    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      if (!db) {
        console.warn('[UserProfile] Firestore not initialized, using mock data');
        const mockUsers = await import('@/mocks/users');
        const user = mockUsers.users.find(u => u.id === userId);
        if (user) {
          setProfileUser(user);
        }
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        setProfileUser({ ...userData, id: userSnap.id });
      } else {
        const mockUsers = await import('@/mocks/users');
        const user = mockUsers.users.find(u => u.id === userId);
        if (user) {
          setProfileUser(user);
        }
      }
    } catch (error) {
      console.error('[UserProfile] Error fetching user:', error);
      const mockUsers = await import('@/mocks/users');
      const user = mockUsers.users.find(u => u.id === userId);
      if (user) {
        setProfileUser(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = useCallback(() => {
    setIsFriend(true);
  }, []);

  const handleRemoveFriend = useCallback(() => {
    setIsFriend(false);
  }, []);

  const handleMessage = useCallback(async () => {
    if (!firebaseContext || !userId) return;

    try {
      const chatId = await firebaseContext.createChat([userId], 'direct');
      if (chatId) {
        router.push('/connect');
      }
    } catch (error) {
      console.error('[UserProfile] Error creating chat:', error);
    }
  }, [firebaseContext, userId, router]);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'award':
        return Award;
      case 'users':
        return Users;
      default:
        return Trophy;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Profile unavailable</Text>
        <Text style={styles.errorSubtext}>This user could not be found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.navy} />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const membershipMonths = Math.floor(
    (new Date().getTime() - new Date(profileUser.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <Image source={{ uri: profileUser.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{profileUser.name}</Text>
        <Text style={styles.username}>{profileUser.username}</Text>
        
        <View style={styles.membershipBadge}>
          <Calendar size={16} color={Colors.gold} />
          <Text style={styles.membershipText}>
            Member for {membershipMonths} months
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={isFriend ? handleRemoveFriend : handleAddFriend}
          >
            {isFriend ? (
              <>
                <UserMinus size={18} color={Colors.navy} />
                <Text style={styles.actionButtonPrimaryText}>Remove Friend</Text>
              </>
            ) : (
              <>
                <UserPlus size={18} color={Colors.navy} />
                <Text style={styles.actionButtonPrimaryText}>Add Friend</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleMessage}
          >
            <MessageCircle size={18} color={Colors.gold} />
            <Text style={styles.actionButtonSecondaryText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={styles.statValue}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileUser.stats.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileUser.stats.following.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'overview' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'overview' && styles.tabTextActive,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'posts' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('posts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'posts' && styles.tabTextActive,
            ]}
          >
            Posts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' ? (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {profileUser.badges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.badgesContainer}>
                {profileUser.badges.map(badge => {
                  const IconComponent = getBadgeIcon(badge.icon);
                  return (
                    <View key={badge.id} style={[styles.badge, { borderColor: badge.color }]}>
                      <View style={[styles.badgeIcon, { backgroundColor: badge.color + '20' }]}>
                        <IconComponent size={24} color={badge.color} />
                      </View>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDate}>
                        {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Golf Stats</Text>
            <View style={styles.golfStatsContainer}>
              <View style={styles.golfStatCard}>
                <View style={styles.golfStatIcon}>
                  <Target size={24} color={Colors.accent} />
                </View>
                <Text style={styles.golfStatValue}>{profileUser.stats.golfRounds}</Text>
                <Text style={styles.golfStatLabel}>Rounds Played</Text>
              </View>
              <View style={styles.golfStatCard}>
                <View style={styles.golfStatIcon}>
                  <TrendingUp size={24} color={Colors.gold} />
                </View>
                <Text style={styles.golfStatValue}>{profileUser.stats.bestScore}</Text>
                <Text style={styles.golfStatLabel}>Best Score</Text>
              </View>
              <View style={styles.golfStatCard}>
                <View style={styles.golfStatIcon}>
                  <Trophy size={24} color={Colors.error} />
                </View>
                <Text style={styles.golfStatValue}>{profileUser.stats.giveawaysWon}</Text>
                <Text style={styles.golfStatLabel}>Giveaways Won</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        <PostGrid
          posts={posts}
          loading={postsLoading}
          refreshing={refreshing}
          hasMore={hasMore}
          onRefresh={onRefresh}
          onLoadMore={onLoadMore}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  backIconButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.gold,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  username: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.gold,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.navy,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.gold,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.gold,
    fontWeight: '700' as const,
  },
  section: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: '31%',
    backgroundColor: Colors.navy,
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  golfStatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  golfStatCard: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  golfStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  golfStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  golfStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});
