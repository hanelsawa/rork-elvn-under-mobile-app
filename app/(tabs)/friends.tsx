import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Users, Search, UserPlus, UserMinus, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { friends as mockFriends, suggestedFriends as mockSuggested, type Friend } from '@/mocks/friends';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>(mockSuggested);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleAddFriend = (friendId: string) => {
    const friend = suggestedFriends.find(f => f.id === friendId);
    if (friend) {
      setFriends(prev => [...prev, { ...friend, isFriend: true }]);
      setSuggestedFriends(prev => prev.filter(f => f.id !== friendId));
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setSuggestedFriends(prev => [...prev, { ...friend, isFriend: false }]);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    }
  };

  const filteredFriends = friends.filter(
    friend =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggested = suggestedFriends.filter(
    friend =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendCard = (friend: Friend, isSuggested: boolean = false) => (
    <View key={friend.id} style={styles.friendCard}>
      <Image source={{ uri: friend.avatar }} style={styles.avatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendUsername}>{friend.username}</Text>
        <View style={styles.chipsContainer}>
          <Text style={styles.chipsText}>{friend.chips.toLocaleString()} chips</Text>
          {isSuggested && friend.mutualFriends && (
            <Text style={styles.mutualText}>• {friend.mutualFriends} mutual</Text>
          )}
          {!isSuggested && friend.lastActive && (
            <Text style={styles.lastActiveText}>• {friend.lastActive}</Text>
          )}
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.viewButton}>
          <Eye size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        {isSuggested ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddFriend(friend.id)}
          >
            <UserPlus size={18} color={Colors.gold} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFriend(friend.id)}
          >
            <UserMinus size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Current Friends</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filteredFriends.length}</Text>
            </View>
          </View>
          {filteredFriends.length > 0 ? (
            filteredFriends.map(friend => renderFriendCard(friend, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserPlus size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Suggested Friends</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filteredSuggested.length}</Text>
            </View>
          </View>
          {filteredSuggested.length > 0 ? (
            filteredSuggested.map(friend => renderFriendCard(friend, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No suggestions found' : 'No suggestions available'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  mutualText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lastActiveText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
