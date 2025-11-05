import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, MessageCircle, Users as UsersIcon, Search, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export default function NewChatModal({ visible, onClose, onChatCreated }: NewChatModalProps) {
  const { createChat, firebaseUser } = useFirebase();
  const [mode, setMode] = useState<'select' | 'direct' | 'group'>('select');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadUsers = useCallback(async () => {
    if (!firebaseUser || !db) {
      console.warn('[NewChatModal] Firebase not initialized');
      return;
    }

    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('id', '!=', firebaseUser.uid)
      );
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersData);
    } catch (error) {
      console.error('[NewChatModal] Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (visible && mode !== 'select') {
      loadUsers();
    }
  }, [visible, mode, loadUsers]);

  const handleClose = () => {
    setMode('select');
    setSelectedUsers([]);
    setGroupName('');
    setSearchQuery('');
    onClose();
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    if (!firebaseUser || !db) {
      alert('Chat feature is not available. Please configure Firebase credentials.');
      return;
    }

    setLoading(true);
    try {
      const chatId = await createChat(
        selectedUsers,
        mode === 'group' ? 'group' : 'direct',
        mode === 'group' ? groupName : undefined
      );

      if (chatId) {
        console.log('[NewChatModal] Chat created:', chatId);
        handleClose();
        onChatCreated(chatId);
      } else {
        alert('Failed to create chat. Please try again.');
      }
    } catch (error) {
      console.error('[NewChatModal] Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : mode === 'direct'
        ? [userId]
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUserSelection(item.id)}
      >
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>{item.username}</Text>
        </View>
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  if (!db || !firebaseUser) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat Unavailable</Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.errorContainer}>
              <AlertCircle size={48} color={Colors.gold} />
              <Text style={styles.errorTitle}>Chat Feature Not Available</Text>
              <Text style={styles.errorMessage}>
                Firebase is not configured. Please add your Firebase credentials to enable chat functionality.
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (mode === 'select') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Chat</Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setMode('direct')}
            >
              <MessageCircle size={20} color={Colors.gold} />
              <Text style={styles.modalOptionText}>New Direct Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setMode('group')}
            >
              <UsersIcon size={20} color={Colors.gold} />
              <Text style={styles.modalOptionText}>New Group Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.fullModalOverlay}>
        <View style={styles.fullModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'direct' ? 'New Direct Message' : 'New Group Chat'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {mode === 'group' && (
            <View style={styles.groupNameContainer}>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Group name (optional)"
                placeholderTextColor={Colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          )}

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {selectedUsers.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedUsers.length} selected
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.usersList}
            />
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              (selectedUsers.length === 0 || loading) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateChat}
            disabled={selectedUsers.length === 0 || loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Chat'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.navy,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  fullModalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullModalContent: {
    flex: 1,
    paddingTop: 60,
  },
  groupNameContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  groupNameInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
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
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  selectedCount: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userItemSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.navy,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
});
