import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Gift, Clock, Users, Trophy } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState, useEffect } from 'react';
import type { Giveaway } from '@/mocks/giveaways';

export default function GiveawaysScreen() {
  const { giveaways, enterGiveaway } = useApp();
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      giveaways.forEach(giveaway => {
        if (giveaway.status === 'active') {
          const now = new Date().getTime();
          const end = new Date(giveaway.endDate).getTime();
          const diff = end - now;

          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            newTimeLeft[giveaway.id] = `${days}d ${hours}h ${minutes}m`;
          } else {
            newTimeLeft[giveaway.id] = 'Ended';
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [giveaways]);

  const handleEnter = (giveaway: Giveaway) => {
    Alert.alert(
      'Enter Giveaway',
      `Enter "${giveaway.title}" for ${giveaway.entryCost} chips?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter',
          onPress: () => {
            const success = enterGiveaway(giveaway.id, giveaway.entryCost);
            if (success) {
              Alert.alert('Success!', 'You\'ve entered the giveaway. Good luck!');
            } else {
              Alert.alert('Insufficient Chips', 'You don\'t have enough chips to enter.');
            }
          },
        },
      ]
    );
  };

  const activeGiveaways = giveaways.filter(g => g.status === 'active');
  const upcomingGiveaways = giveaways.filter(g => g.status === 'upcoming');
  const endedGiveaways = giveaways.filter(g => g.status === 'ended');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Giveaways</Text>
        {activeGiveaways.map(giveaway => (
          <View key={giveaway.id} style={styles.giveawayCard}>
            <Image source={{ uri: giveaway.image }} style={styles.giveawayImage} />
            <View style={styles.giveawayContent}>
              <View style={styles.prizeTag}>
                <Gift size={16} color={Colors.white} />
                <Text style={styles.prizeTagText}>{giveaway.prize}</Text>
              </View>
              <Text style={styles.giveawayTitle}>{giveaway.title}</Text>
              <Text style={styles.giveawayDescription}>{giveaway.description}</Text>

              <View style={styles.giveawayStats}>
                <View style={styles.statItem}>
                  <Clock size={18} color={Colors.accent} />
                  <Text style={styles.statText}>{timeLeft[giveaway.id] || 'Loading...'}</Text>
                </View>
                <View style={styles.statItem}>
                  <Users size={18} color={Colors.accent} />
                  <Text style={styles.statText}>{giveaway.totalEntries} entries</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.enterButton}
                onPress={() => handleEnter(giveaway)}
              >
                <Text style={styles.enterButtonText}>
                  Enter for {giveaway.entryCost} chips
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {upcomingGiveaways.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          {upcomingGiveaways.map(giveaway => (
            <View key={giveaway.id} style={styles.upcomingCard}>
              <Image source={{ uri: giveaway.image }} style={styles.upcomingImage} />
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingTitle}>{giveaway.title}</Text>
                <Text style={styles.upcomingDescription} numberOfLines={2}>
                  {giveaway.description}
                </Text>
                <View style={styles.upcomingBadge}>
                  <Clock size={14} color={Colors.warning} />
                  <Text style={styles.upcomingBadgeText}>Coming Soon</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {endedGiveaways.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Winners</Text>
          {endedGiveaways.map(giveaway => (
            <View key={giveaway.id} style={styles.winnerCard}>
              <Image source={{ uri: giveaway.image }} style={styles.winnerImage} />
              <View style={styles.winnerContent}>
                <Text style={styles.winnerTitle}>{giveaway.title}</Text>
                {giveaway.winner && (
                  <View style={styles.winnerInfo}>
                    <Trophy size={16} color={Colors.gold} />
                    <Image
                      source={{ uri: giveaway.winner.userAvatar }}
                      style={styles.winnerAvatar}
                    />
                    <Text style={styles.winnerName}>{giveaway.winner.userName}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  giveawayCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  giveawayImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
  },
  giveawayContent: {
    padding: 16,
  },
  prizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 12,
  },
  prizeTagText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  giveawayTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  giveawayDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  giveawayStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  enterButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  upcomingImage: {
    width: 100,
    height: 100,
    backgroundColor: Colors.lightGray,
  },
  upcomingContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  upcomingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  winnerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  winnerImage: {
    width: 80,
    height: 80,
    backgroundColor: Colors.lightGray,
  },
  winnerContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  winnerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  winnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  winnerName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 32,
  },
});
