import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Users as UsersIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { FirebaseChat } from '@/contexts/FirebaseContext';
import { Timestamp } from 'firebase/firestore';

interface ChatListProps {
  chats: FirebaseChat[];
  unreadCounts: { [chatId: string]: number };
  onChatPress: (chat: FirebaseChat) => void;
}

export default function ChatList({ chats, unreadCounts, onChatPress }: ChatListProps) {
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderChatItem = ({ item }: { item: FirebaseChat }) => {
    const unreadCount = unreadCounts[item.id] || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => onChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatItemHeader}>
            <View style={styles.chatNameContainer}>
              <Text style={styles.chatName}>{item.name}</Text>
              {item.type === 'group' && (
                <UsersIcon size={14} color={Colors.textSecondary} style={styles.groupIcon} />
              )}
            </View>
            <Text style={styles.chatTime}>
              {formatTimestamp(item.lastMessageTime)}
            </Text>
          </View>
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chats yet</Text>
        <Text style={styles.emptySubtext}>Start a conversation with your friends!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  groupIcon: {
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
