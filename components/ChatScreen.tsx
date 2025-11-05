import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FirebaseChat, FirebaseMessage, useFirebase } from '@/contexts/FirebaseContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import * as ImagePicker from 'expo-image-picker';

interface ChatScreenProps {
  chat: FirebaseChat;
  onBack: () => void;
}

export default function ChatScreen({ chat, onBack }: ChatScreenProps) {
  const firebaseContext = useFirebase();
  const [messageText, setMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = firebaseContext?.messages || {};
  const sendMessage = firebaseContext?.sendMessage;
  const markMessagesAsRead = firebaseContext?.markMessagesAsRead;
  const setTyping = firebaseContext?.setTyping;
  const firebaseUser = firebaseContext?.firebaseUser;
  const chatMessages = messages[chat.id] || [];

  useEffect(() => {
    if (markMessagesAsRead) {
      markMessagesAsRead(chat.id);
    }
  }, [chat.id, markMessagesAsRead]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);

    if (!setTyping) return;

    if (text.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(chat.id, true);
    } else if (!text.trim() && isTyping) {
      setIsTyping(false);
      setTyping(chat.id, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(chat.id, false);
      }
    }, 2000);
  }, [chat.id, isTyping, setTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !sendMessage || !setTyping) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setIsTyping(false);
    setTyping(chat.id, false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await sendMessage(chat.id, textToSend, 'text');
  }, [messageText, chat.id, sendMessage, setTyping]);

  const handleImagePick = useCallback(async () => {
    if (!sendMessage) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      console.log('[ChatScreen] Image picker permission denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      console.log('[ChatScreen] Image selected:', imageUri);
      await sendMessage(chat.id, 'Sent an image', 'image', imageUri);
    }
  }, [chat.id, sendMessage]);

  const renderMessage = useCallback(({ item, index }: { item: FirebaseMessage; index: number }) => {
    const isCurrentUser = item.senderId === firebaseUser?.uid;
    const previousMessage = index > 0 ? chatMessages[index - 1] : null;
    const showAvatar = !previousMessage || previousMessage.senderId !== item.senderId;
    const showSenderName = chat.type === 'group' && showAvatar && !isCurrentUser;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        showSenderName={showSenderName}
      />
    );
  }, [firebaseUser, chatMessages, chat.type]);

  if (!firebaseContext) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.textPrimary, textAlign: 'center', marginTop: 20 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat.name}</Text>
          {chat.type === 'group' && (
            <Text style={styles.headerSubtext}>
              {chat.participants.length} members
            </Text>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? <TypingIndicator userName={chat.type === 'group' ? undefined : chat.name} /> : null
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
          <ImageIcon size={20} color={Colors.gold} />
        </TouchableOpacity>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSecondary}
          value={messageText}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Send
            size={20}
            color={messageText.trim() ? Colors.navy : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
