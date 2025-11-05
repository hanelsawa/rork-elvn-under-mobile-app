import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, UserPlus, MessageCircle, Users, Plus, Eye, UserMinus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { friends as mockFriends, suggestedFriends as mockSuggested, type Friend } from '@/mocks/friends';
import { useFirebase } from '@/contexts/FirebaseContext';
import ChatScreen from '@/components/ChatScreen';
import NewChatModal from '@/components/NewChatModal';
import type { FirebaseChat } from '@/contexts/FirebaseContext';

type ViewMode = 'friends' | 'messages';

export default function ConnectScreen() {
  const firebaseContext = useFirebase();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('friends');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>(mockSuggested);
  const [selectedChat, setSelectedChat] = useState<FirebaseChat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);

  const chats = firebaseContext?.chats || [];
  const unreadCounts = firebaseContext?.unreadCounts || {};
  const loading = firebaseContext?.loading || false;

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

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

  const handleChatPress = (chat: FirebaseChat) => {
    setSelectedChat(chat);
  };

  const handleChatCreated = (chatId: string) => {
    const newChat = chats.find(c => c.id === chatId);
    if (newChat) {
      setSelectedChat(newChat);
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

  const filteredChats = chats.filter(
    chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    return <ChatScreen chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  if (!firebaseContext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <Text style={styles.headerSubtext}>Chat, add friends, and grow your golf network.</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'friends' && styles.segmentButtonActive]}
          onPress={() => setViewMode('friends')}
        >
          <Users size={20} color={viewMode === 'friends' ? Colors.gold : Colors.textSecondary} />
          <Text style={[styles.segmentText, viewMode === 'friends' && styles.segmentTextActive]}>
            Friends
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{friends.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'messages' && styles.segmentButtonActive]}
          onPress={() => setViewMode('messages')}
        >
          <MessageCircle size={20} color={viewMode === 'messages' ? Colors.gold : Colors.textSecondary} />
          <Text style={[styles.segmentText, viewMode === 'messages' && styles.segmentTextActive]}>
            Messages
          </Text>
          {totalUnread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={viewMode === 'friends' ? 'Search members...' : 'Search chats...'}
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {viewMode === 'friends' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={Colors.gold} />
              <Text style={styles.sectionTitle}>My Friends</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filteredFriends.length}</Text>
              </View>
            </View>
            {filteredFriends.length > 0 ? (
              filteredFriends.map(friend => (
                <View key={friend.id} style={styles.friendCard}>
                  <TouchableOpacity
                    style={styles.friendCardContent}
                    onPress={() => router.push(`/profile/${friend.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendUsername}>{friend.username}</Text>
                      <View style={styles.chipsContainer}>
                        <Text style={styles.chipsText}>{friend.chips.toLocaleString()} chips</Text>
                        {friend.lastActive && (
                          <Text style={styles.lastActiveText}>• {friend.lastActive}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.messageButton}>
                      <MessageCircle size={18} color={Colors.gold} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveFriend(friend.id)}
                    >
                      <UserMinus size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
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
              filteredSuggested.map(friend => (
                <View key={friend.id} style={styles.friendCard}>
                  <TouchableOpacity
                    style={styles.friendCardContent}
                    onPress={() => router.push(`/profile/${friend.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendUsername}>{friend.username}</Text>
                      <View style={styles.chipsContainer}>
                        <Text style={styles.chipsText}>{friend.chips.toLocaleString()} chips</Text>
                        {friend.mutualFriends && (
                          <Text style={styles.mutualText}>• {friend.mutualFriends} mutual</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.viewButton}>
                      <Eye size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddFriend(friend.id)}
                    >
                      <UserPlus size={18} color={Colors.gold} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No suggestions found' : 'No suggestions available'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>You&apos;ve connected with {friends.length} members</Text>
            <Text style={styles.summarySubtext}>Keep building your ELVN crew</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min((friends.length / 50) * 100, 100)}%` }]} />
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {filteredChats.length > 0 ? (
                filteredChats.map(chat => {
                  const unreadCount = unreadCounts[chat.id] || 0;
                  return (
                    <TouchableOpacity
                      key={chat.id}
                      style={styles.chatCard}
                      onPress={() => handleChatPress(chat)}
                    >
                      <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                      <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                          <Text style={styles.chatName}>{chat.name}</Text>
                          <Text style={styles.chatTime}>
                            {chat.lastMessageTime?.toDate ? 
                              new Date(chat.lastMessageTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                              'Now'}
                          </Text>
                        </View>
                        <Text style={styles.chatLastMessage} numberOfLines={1}>
                          {chat.lastMessage}
                        </Text>
                      </View>
                      {unreadCount > 0 && (
                        <View style={styles.unreadDot}>
                          <Text style={styles.unreadDotText}>{unreadCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <MessageCircle size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No chats found' : 'No messages yet'}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Start a conversation with your golf mates
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowNewChatModal(true)}
          >
            <Plus size={24} color={Colors.navy} />
          </TouchableOpacity>

          <NewChatModal
            visible={showNewChatModal}
            onClose={() => setShowNewChatModal(false)}
            onChatCreated={handleChatCreated}
          />
        </>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
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
  countBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  unreadBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
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
    paddingBottom: 100,
  },
  section: {
    marginTop: 8,
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
  friendCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
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
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.navy,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  chatCard: {
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
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatLastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unreadDot: {
    backgroundColor: Colors.gold,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadDotText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
});
