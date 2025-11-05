import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Trophy, Award, Users, Calendar, TrendingUp, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user } = useApp();

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

  const membershipMonths = Math.floor(
    (new Date().getTime() - new Date(user.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>{user.username}</Text>
        
        <View style={styles.membershipBadge}>
          <Calendar size={16} color={Colors.gold} />
          <Text style={styles.membershipText}>
            Member for {membershipMonths} months
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.following.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgesContainer}>
          {user.badges.map(badge => {
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Golf Stats</Text>
        <View style={styles.golfStatsContainer}>
          <View style={styles.golfStatCard}>
            <View style={styles.golfStatIcon}>
              <Target size={24} color={Colors.accent} />
            </View>
            <Text style={styles.golfStatValue}>{user.stats.golfRounds}</Text>
            <Text style={styles.golfStatLabel}>Rounds Played</Text>
          </View>
          <View style={styles.golfStatCard}>
            <View style={styles.golfStatIcon}>
              <TrendingUp size={24} color={Colors.gold} />
            </View>
            <Text style={styles.golfStatValue}>{user.stats.bestScore}</Text>
            <Text style={styles.golfStatLabel}>Best Score</Text>
          </View>
          <View style={styles.golfStatCard}>
            <View style={styles.golfStatIcon}>
              <Trophy size={24} color={Colors.error} />
            </View>
            <Text style={styles.golfStatValue}>{user.stats.giveawaysWon}</Text>
            <Text style={styles.golfStatLabel}>Giveaways Won</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsButton}>
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  editButton: {
    backgroundColor: Colors.gold,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  settingsButton: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bottomSpacer: {
    height: 32,
  },
});
