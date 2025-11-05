import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Send, X } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { ProfilePost } from '@/components/profile/PostCard';

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  
  const [post] = useState<ProfilePost>({
    id: id || '',
    authorId: 'user123',
    type: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    caption: 'Perfect day at Royal Melbourne! Shot my personal best today 🏌️‍♂️⛳',
    createdAt: new Date(),
    likesCount: 234,
    commentsCount: 12,
    visibility: 'public',
  });

  const [comments] = useState([
    {
      id: 'c1',
      userId: 'user2',
      userName: 'Jordan Lee',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      content: 'Congrats! That course is tough!',
      timestamp: new Date(),
      likes: 5,
    },
    {
      id: 'c2',
      userId: 'user3',
      userName: 'Sam Taylor',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      content: 'Amazing shot! Keep it up 💪',
      timestamp: new Date(),
      likes: 3,
    },
  ]);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  const handleComment = useCallback(() => {
    if (commentText.trim()) {
      console.log('Posting comment:', commentText);
      setCommentText('');
    }
  }, [commentText]);

  const handleShare = useCallback(() => {
    console.log('Sharing post:', id);
  }, [id]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.headerTitle}>Post</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.authorSection}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>Alex Morgan</Text>
                <Text style={styles.postDate}>2 hours ago</Text>
              </View>
            </View>

            {post.mediaUrl && (
              <Image
                source={{ uri: post.mediaUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.actionsSection}>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={26}
                    color={isLiked ? Colors.error : Colors.textPrimary}
                    fill={isLiked ? Colors.error : 'none'}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      isLiked && { color: Colors.error },
                    ]}
                  >
                    {post.likesCount + (isLiked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <MessageCircle size={26} color={Colors.textPrimary} />
                  <Text style={styles.actionText}>{post.commentsCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Share2 size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.captionSection}>
              <Text style={styles.caption}>{post.caption}</Text>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Image
                    source={{ uri: comment.userAvatar }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUserName}>
                      {comment.userName}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <Text style={styles.commentTime}>2h ago</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom + 12 }]}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={Colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleComment}
              disabled={!commentText.trim()}
            >
              <Send
                size={20}
                color={
                  commentText.trim() ? Colors.navy : Colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.cardBackground,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  postDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.cardBackground,
  },
  actionsSection: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  captionSection: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  commentsSection: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.background,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
});
