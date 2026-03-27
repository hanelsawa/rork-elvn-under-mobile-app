import { View, Text, StyleSheet, Image } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { FirebaseMessage } from '@/contexts/FirebaseContext';
import { Timestamp } from 'firebase/firestore';

interface MessageBubbleProps {
  message: FirebaseMessage;
  isCurrentUser: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  showSenderName,
}: MessageBubbleProps) {
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.messageRight : styles.messageLeft,
      ]}
    >
      {!isCurrentUser && showAvatar && (
        <Image source={{ uri: message.senderAvatar }} style={styles.messageAvatar} />
      )}
      {!isCurrentUser && !showAvatar && <View style={styles.avatarPlaceholder} />}
      
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
        ]}
      >
        {showSenderName && !isCurrentUser && (
          <Text style={styles.messageSenderName}>{message.senderName}</Text>
        )}
        
        {message.type === 'image' && message.imageUrl && (
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
        )}
        
        {message.content && (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {message.content}
          </Text>
        )}
        
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.messageTimeRight : styles.messageTimeLeft,
            ]}
          >
            {formatTimestamp(message.createdAt)}
          </Text>
          
          {isCurrentUser && (
            <View style={styles.readReceipt}>
              {message.readBy.length > 1 ? (
                <CheckCheck size={14} color={Colors.navy} style={styles.checkIcon} />
              ) : (
                <Check size={14} color={Colors.navy} style={styles.checkIcon} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  messageSenderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: Colors.textPrimary,
  },
  messageTextRight: {
    color: Colors.navy,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeLeft: {
    color: Colors.textSecondary,
  },
  messageTimeRight: {
    color: Colors.navy,
    opacity: 0.7,
  },
  readReceipt: {
    marginLeft: 2,
  },
  checkIcon: {
    opacity: 0.7,
  },
});
