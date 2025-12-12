import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import type { Post } from '@/mocks/posts';

export default function HubScreen() {
  const { posts, toggleLike, addComment, updateChips } = useApp();
  const router = useRouter();
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const postButtonRefs = useRef<{ [key: string]: View | null }>({});
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardWillShow.remove();
    };
  }, []);

  const handleAddComment = (postId: string) => {
    const text = commentText[postId];
    if (text?.trim()) {
      addComment(postId, text.trim());
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      const buttonRef = postButtonRefs.current[postId];
      if (buttonRef) {
        buttonRef.measure((_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
          updateChips(10, { x: pageX + width / 2, y: pageY + height / 2 });
        });
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <TouchableOpacity 
        style={styles.postHeader}
        onPress={() => router.push(`/profile/${item.userId}` as any)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Heart
            size={24}
            color={item.isLiked ? Colors.error : Colors.textSecondary}
            fill={item.isLiked ? Colors.error : 'none'}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            setShowComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))
          }
        >
          <MessageCircle size={24} color={Colors.textSecondary} />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showComments[item.id] && (
        <View style={styles.commentsSection}>
          {item.comments.map(comment => (
            <View key={comment.id} style={styles.comment}>
              <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <Text style={styles.commentUserName}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTimestamp}>
                  {formatTimestamp(comment.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={Colors.textSecondary}
              value={commentText[item.id] || ''}
              onChangeText={text =>
                setCommentText(prev => ({ ...prev, [item.id]: text }))
              }
              onSubmitEditing={() => handleAddComment(item.id)}
            />
            <TouchableOpacity
              ref={ref => {
                postButtonRefs.current[item.id] = ref;
              }}
              style={styles.postCommentButton}
              onPress={() => handleAddComment(item.id)}
            >
              <Text style={styles.postCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingVertical: 16,
  },
  postCard: {
    backgroundColor: Colors.cardBackground,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.lightGray,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  likedText: {
    color: Colors.error,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: Colors.navy,
    borderRadius: 12,
    padding: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  commentTimestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postCommentButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  postCommentText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
