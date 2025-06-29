import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  // Format the date as "X time ago"
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: comment.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
        }}
        style={styles.avatar}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>{comment.username}</Text>
          <Text style={styles.timestamp}>{timeAgo}</Text>
        </View>
        
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.sm,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  content: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
});