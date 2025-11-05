import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageCircle, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import ChatList from '@/components/ChatList';
import ChatScreen from '@/components/ChatScreen';
import NewChatModal from '@/components/NewChatModal';
import type { FirebaseChat } from '@/contexts/FirebaseContext';

export default function ChatTab() {
  const firebaseContext = useFirebase();
  const [selectedChat, setSelectedChat] = useState<FirebaseChat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);

  if (!firebaseContext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  const { chats, unreadCounts, loading } = firebaseContext;

  const handleChatPress = (chat: FirebaseChat) => {
    console.log('[ChatTab] Opening chat:', chat.id);
    setSelectedChat(chat);
  };

  const handleChatCreated = (chatId: string) => {
    console.log('[ChatTab] Chat created:', chatId);
    const newChat = chats.find(c => c.id === chatId);
    if (newChat) {
      setSelectedChat(newChat);
    }
  };

  if (selectedChat) {
    return <ChatScreen chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MessageCircle size={24} color={Colors.gold} />
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
      </View>

      <ChatList chats={chats} unreadCounts={unreadCounts} onChatPress={handleChatPress} />

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
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
