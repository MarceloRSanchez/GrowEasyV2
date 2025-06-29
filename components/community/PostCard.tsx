import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Heart, MessageCircle, Share } from 'lucide-react-native';
import { Post } from '@/hooks/useFeedPosts';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  isLiked?: boolean;
}

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = (width - Spacing.md * 2) * 1.25; // 4:5 aspect ratio

export function PostCard({ post, onLike, onComment, onShare, isLiked = false }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {post.avatar_url ? (
              <Image source={{ uri: post.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {post.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Image */}
      <Image
        source={{ uri: post.photo_url }}
        style={styles.image}
        accessibilityLabel="Post image"
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onLike?.(post.id)}
          accessibilityLabel={isLiked ? "Unlike post" : "Like post"}
          accessibilityRole="button"
        >
          <Heart 
            size={24} 
            color={isLiked ? Colors.error : Colors.textMuted} 
            fill={isLiked ? Colors.error : 'transparent'} 
          />
          <Text style={styles.actionText}>{post.likes_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onComment?.(post.id)}
          accessibilityLabel="Comment on post"
          accessibilityRole="button"
        >
          <MessageCircle size={24} color={Colors.textMuted} />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onShare?.(post.id)}
          accessibilityLabel="Share post"
          accessibilityRole="button"
        >
          <Share size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  username: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  captionContainer: {
    padding: Spacing.md,
  },
  caption: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
});