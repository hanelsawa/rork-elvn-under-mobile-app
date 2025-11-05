import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Video, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;

export interface ProfilePost {
  id: string;
  authorId: string;
  type: 'photo' | 'video' | 'text';
  mediaUrl?: string;
  caption: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  visibility: 'public' | 'members';
}

interface PostCardProps {
  post: ProfilePost;
  onPress: () => void;
  variant?: 'grid' | 'list';
}

export default function PostCard({ post, onPress, variant = 'grid' }: PostCardProps) {
  if (variant === 'grid') {
    return (
      <TouchableOpacity 
        style={styles.gridCard} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        {post.type === 'photo' && post.mediaUrl ? (
          <Image 
            source={{ uri: post.mediaUrl }} 
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : post.type === 'video' && post.mediaUrl ? (
          <>
            <Image 
              source={{ uri: post.mediaUrl }} 
              style={styles.gridImage}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <View style={styles.playIconContainer}>
                <Play size={20} color={Colors.white} fill={Colors.white} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.textPostCard}>
            <Text style={styles.textPostContent} numberOfLines={4}>
              {post.caption}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.listContent}>
        <Text style={styles.listCaption} numberOfLines={2}>
          {post.caption}
        </Text>
        <View style={styles.listMeta}>
          <Text style={styles.listMetaText}>
            {post.likesCount} likes • {post.commentsCount} comments
          </Text>
          <Text style={styles.listMetaDate}>
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>
      
      {post.mediaUrl && (
        <View style={styles.listThumbnailContainer}>
          <Image 
            source={{ uri: post.mediaUrl }} 
            style={styles.listThumbnail}
            resizeMode="cover"
          />
          {post.type === 'video' && (
            <View style={styles.listVideoIcon}>
              <Video size={16} color={Colors.white} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  gridCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textPostCard: {
    width: '100%',
    height: '100%',
    padding: 12,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.gold,
    justifyContent: 'center',
  },
  textPostContent: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    flex: 1,
    marginRight: 12,
  },
  listCaption: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  listMeta: {
    gap: 4,
  },
  listMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listMetaDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listThumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  listThumbnail: {
    width: '100%',
    height: '100%',
  },
  listVideoIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
