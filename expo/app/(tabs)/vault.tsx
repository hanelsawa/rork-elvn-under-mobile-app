import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  Gift,
  Clock,
  Users,
  Trophy,
  Coins,
  Video,
  Share2,
  Users as UsersIcon,
  CreditCard,
  Award,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import type { Giveaway } from '@/mocks/giveaways';
import { LinearGradient } from 'expo-linear-gradient';

type ViewMode = 'giveaways' | 'chips';

interface ChipCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerNote?: string;
  icon?: React.ReactNode;
}

const ChipCard = ({ title, description, children, footerNote, icon }: ChipCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {icon && <View style={styles.cardIcon}><Text>{icon}</Text></View>}
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
    <View style={styles.cardContent}>{children}</View>
    {footerNote && <Text style={styles.footerNote}>{footerNote}</Text>}
  </View>
);

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const InfoRow = ({ label, value, highlight }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
  </View>
);

interface TierCardProps {
  tier: string;
  chips: number;
  entries: number;
  color: string;
}

const TierCard = ({ tier, chips, entries, color }: TierCardProps) => (
  <View style={[styles.tierCard, { borderColor: color }]}>
    <View style={[styles.tierBadge, { backgroundColor: color }]}>
      <Text style={styles.tierBadgeText}>{tier}</Text>
    </View>
    <View style={styles.tierInfo}>
      <View style={styles.tierRow}>
        <Coins size={16} color={Colors.gold} />
        <Text style={styles.tierChips}>{chips} Chips</Text>
      </View>
      <Text style={styles.tierEntries}>{entries} {entries === 1 ? 'entry' : 'entries'}</Text>
    </View>
  </View>
);

export default function VaultScreen() {
  const { giveaways, enterGiveaway, user } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('giveaways');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Vault</Text>
        <Text style={styles.headerSubtext}>
          Enter giveaways, earn Chips, and unlock rewards.
        </Text>
        <View style={styles.balanceBadge}>
          <Coins size={24} color={Colors.gold} />
          <Text style={styles.balanceAmount}>{user.chips.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}>Your Balance</Text>
        </View>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'giveaways' && styles.segmentButtonActive]}
          onPress={() => setViewMode('giveaways')}
        >
          <Gift size={20} color={viewMode === 'giveaways' ? Colors.gold : Colors.textSecondary} />
          <Text style={[styles.segmentText, viewMode === 'giveaways' && styles.segmentTextActive]}>
            Giveaways
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'chips' && styles.segmentButtonActive]}
          onPress={() => setViewMode('chips')}
        >
          <Coins size={20} color={viewMode === 'chips' ? Colors.gold : Colors.textSecondary} />
          <Text style={[styles.segmentText, viewMode === 'chips' && styles.segmentTextActive]}>
            Chips
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'giveaways' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Active Giveaways</Text>
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

          <LinearGradient
            colors={['#D4AF37', '#C9A227']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBanner}
          >
            <Text style={styles.ctaTitle}>Stack your Chips.</Text>
            <Text style={styles.ctaSubtext}>
              Secure your spot in this month&apos;s giveaway.
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Enter Now</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ChipCard
            title="Monthly Membership Rewards"
            description="Earn Chips automatically every month based on your membership tier."
            icon={<Award size={24} color={Colors.gold} />}
          >
            <View style={styles.tierCardsContainer}>
              <TierCard tier="Starter" chips={100} entries={1} color={Colors.bronze} />
              <TierCard tier="Pro" chips={200} entries={2} color={Colors.silver} />
              <TierCard tier="Elite" chips={300} entries={3} color={Colors.gold} />
            </View>
          </ChipCard>

          <ChipCard
            title="Video Challenges 🎥"
            description="Upload your best shots or trickshots on the Hub to earn Chips."
            icon={<Video size={24} color={Colors.gold} />}
            footerNote="Reviewed by the ELVN Team before Chips are added."
          >
            <InfoRow label="Approved Submission" value="+25 Chips" highlight />
            <InfoRow label="Challenge Winner" value="+100 Chips" highlight />
          </ChipCard>

          <ChipCard
            title="Social Engagement 💬"
            description="Support ELVN and earn Chips by sharing posts."
            icon={<Share2 size={24} color={Colors.gold} />}
            footerNote="Rewards verified manually to keep it fair."
          >
            <InfoRow label="Repost Giveaway Story" value="+50 Chips" highlight />
            <InfoRow label="Tag 2 Friends" value="+25 Chips" highlight />
          </ChipCard>

          <ChipCard
            title="Referrals 🧍‍♂️"
            description="Invite your golf mates — everyone wins."
            icon={<UsersIcon size={24} color={Colors.gold} />}
            footerNote="Chips added after your friend's first payment."
          >
            <InfoRow label="You (Referrer)" value="+100 Chips" highlight />
            <InfoRow label="Your Friend" value="+50 Chips" highlight />
          </ChipCard>

          <ChipCard
            title="Leaderboards 🏆 (Coming Soon)"
            description="Compete for top spots and earn extra Chips."
            icon={<Trophy size={24} color={Colors.gold} />}
          >
            <InfoRow label="1st Place" value="+200 Chips" highlight />
            <InfoRow label="2nd Place" value="+150 Chips" highlight />
            <InfoRow label="3rd Place" value="+100 Chips" highlight />
          </ChipCard>

          <ChipCard
            title="💳 Buy Chips"
            description="Need more entries for this month's giveaway? Top up instantly."
            icon={<CreditCard size={24} color={Colors.gold} />}
          >
            <View style={styles.priceTable}>
              <View style={styles.priceTableHeader}>
                <Text style={styles.priceTableHeaderCell}>Tier</Text>
                <Text style={styles.priceTableHeaderCell}>100 Chips</Text>
                <Text style={styles.priceTableHeaderCell}>200 Chips</Text>
                <Text style={styles.priceTableHeaderCell}>300 Chips</Text>
              </View>
              <View style={styles.priceTableRow}>
                <View style={[styles.tierBadgeSmall, { backgroundColor: Colors.bronze }]}>
                  <Text style={styles.tierBadgeSmallText}>Starter</Text>
                </View>
                <Text style={styles.priceCell}>$4.99</Text>
                <Text style={styles.priceCell}>$7.99</Text>
                <Text style={styles.priceCell}>$9.99</Text>
              </View>
              <View style={styles.priceTableRow}>
                <View style={[styles.tierBadgeSmall, { backgroundColor: Colors.silver }]}>
                  <Text style={styles.tierBadgeSmallText}>Pro</Text>
                </View>
                <Text style={styles.priceCell}>$3.99</Text>
                <Text style={styles.priceCell}>$6.99</Text>
                <Text style={styles.priceCell}>$8.99</Text>
              </View>
              <View style={styles.priceTableRow}>
                <View style={[styles.tierBadgeSmall, { backgroundColor: Colors.gold }]}>
                  <Text style={styles.tierBadgeSmallText}>Elite</Text>
                </View>
                <Text style={styles.priceCell}>$2.99</Text>
                <Text style={styles.priceCell}>$5.49</Text>
                <Text style={styles.priceCell}>$7.49</Text>
              </View>
            </View>
          </ChipCard>

          <LinearGradient
            colors={['#D4AF37', '#C9A227']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBanner}
          >
            <Text style={styles.ctaTitle}>Start earning today.</Text>
            <Text style={styles.ctaSubtext}>
              Join the ELVN community, stack your Chips, and take your shot at this month&apos;s
              giveaway.
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Join Now</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: Colors.navy,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.gold,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
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
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardContent: {
    gap: 12,
  },
  footerNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  infoValueHighlight: {
    color: Colors.gold,
  },
  tierCardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tierCard: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  tierInfo: {
    alignItems: 'center',
    gap: 6,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierChips: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  tierEntries: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceTable: {
    gap: 12,
  },
  priceTableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  priceTableHeaderCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
    textAlign: 'center',
  },
  priceTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tierBadgeSmall: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tierBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  priceCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  ctaBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.navy,
    marginBottom: 8,
  },
  ctaSubtext: {
    fontSize: 14,
    color: Colors.navy,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bottomSpacer: {
    height: 32,
  },
});
