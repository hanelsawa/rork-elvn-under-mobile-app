import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Coins, ShoppingCart, Video, Share2, Users as UsersIcon, Trophy, CreditCard, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";

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

export default function ChipsScreen() {
  const { user } = useApp();
  const insets = useSafeAreaInsets();

  const getRankProgress = (chips: number) => {
    if (chips < 500) return { rank: 'Bronze', progress: chips / 500, next: 500 };
    if (chips < 1000) return { rank: 'Silver', progress: (chips - 500) / 500, next: 1000 };
    if (chips < 2000) return { rank: 'Gold', progress: (chips - 1000) / 1000, next: 2000 };
    return { rank: 'Platinum', progress: 1, next: 2000 };
  };

  const rankData = getRankProgress(user.chips);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, Platform.OS === 'web' ? {} : { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>ELVN Chips</Text>
              <Text style={styles.headerSubtext}>
                Earn Chips. Climb the Ranks. Win Premium Golf Prizes.
              </Text>
            </View>
            <TouchableOpacity style={styles.buyButton}>
              <ShoppingCart size={18} color={Colors.navy} />
              <Text style={styles.buyButtonText}>Buy More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.balanceBadge}>
            <Coins size={32} color={Colors.gold} />
            <Text style={styles.balanceAmount}>{user.chips.toLocaleString()}</Text>
            <Text style={styles.balanceLabel}>Your Balance</Text>
          </View>
        </View>

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
          title="Buy Extra Chips 💳"
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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Award size={24} color={Colors.gold} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Your ELVN Rank</Text>
              <Text style={styles.cardDescription}>
                Earn more Chips to climb levels and unlock badges.
              </Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.rankProgressContainer}>
              <View style={styles.rankStages}>
                <View style={styles.rankStage}>
                  <View style={[styles.rankIcon, { backgroundColor: Colors.bronze }]}>
                    <Award size={16} color={Colors.white} />
                  </View>
                  <Text style={styles.rankLabel}>Bronze</Text>
                  <Text style={styles.rankRange}>0-499</Text>
                </View>
                <View style={styles.rankStage}>
                  <View style={[styles.rankIcon, { backgroundColor: Colors.silver }]}>
                    <Award size={16} color={Colors.white} />
                  </View>
                  <Text style={styles.rankLabel}>Silver</Text>
                  <Text style={styles.rankRange}>500-999</Text>
                </View>
                <View style={styles.rankStage}>
                  <View style={[styles.rankIcon, { backgroundColor: Colors.gold }]}>
                    <Award size={16} color={Colors.navy} />
                  </View>
                  <Text style={styles.rankLabel}>Gold</Text>
                  <Text style={styles.rankRange}>1000-1999</Text>
                </View>
                <View style={styles.rankStage}>
                  <View style={[styles.rankIcon, { backgroundColor: '#E5E7EB' }]}>
                    <Award size={16} color={Colors.navy} />
                  </View>
                  <Text style={styles.rankLabel}>Platinum</Text>
                  <Text style={styles.rankRange}>2000+</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${rankData.progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {user.chips} / {rankData.next} Chips
                </Text>
              </View>
            </View>
          </View>
        </View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    maxWidth: 240,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  balanceBadge: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginTop: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  rankProgressContainer: {
    gap: 20,
  },
  rankStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankStage: {
    alignItems: 'center',
    gap: 6,
  },
  rankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rankRange: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.navy,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
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
});
