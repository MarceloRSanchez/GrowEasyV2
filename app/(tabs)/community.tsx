import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  MessageCircle,
  Share,
  Trophy,
  Users,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react-native';

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  plantTag?: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  ecoPoints: number;
  plantsGrown: number;
  rank: number;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Green',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      level: 5,
    },
    content: 'My first tomato harvest! 🍅 These cherry tomatoes grew faster than expected. Thanks to everyone who helped with the watering schedule!',
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 24,
    comments: 8,
    timestamp: '2h ago',
    plantTag: 'Tomato',
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      level: 3,
    },
    content: 'Started my indoor herb garden today! Planted basil, mint, and rosemary. Any tips for beginners?',
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 15,
    comments: 12,
    timestamp: '4h ago',
    plantTag: 'Herbs',
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      level: 7,
    },
    content: 'My succulent collection is thriving! These little guys are perfect for apartment living. 🌵',
    likes: 31,
    comments: 5,
    timestamp: '6h ago',
    plantTag: 'Succulent',
  },
];

const mockLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    ecoPoints: 2450,
    plantsGrown: 18,
    rank: 1,
  },
  {
    id: '2',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    ecoPoints: 2180,
    plantsGrown: 15,
    rank: 2,
  },
  {
    id: '3',
    name: 'Sarah Green',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    ecoPoints: 1920,
    plantsGrown: 12,
    rank: 3,
  },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} color="#FFD700" />;
      case 2:
        return <Award size={20} color="#C0C0C0" />;
      case 3:
        return <Star size={20} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <Card style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>L{item.user.level}</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
        {item.plantTag && (
          <View style={styles.plantTag}>
            <Text style={styles.plantTagText}>{item.plantTag}</Text>
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post Image */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Heart
            size={20}
            color={likedPosts.has(item.id) ? Colors.error : Colors.textMuted}
            fill={likedPosts.has(item.id) ? Colors.error : 'none'}
          />
          <Text style={styles.actionText}>
            {item.likes + (likedPosts.has(item.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color={Colors.textMuted} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => (
    <Card style={styles.leaderboardCard}>
      <View style={styles.leaderboardContent}>
        <View style={styles.rankContainer}>
          {getRankIcon(item.rank)}
        </View>
        
        <Image source={{ uri: item.avatar }} style={styles.leaderboardAvatar} />
        
        <View style={styles.leaderboardInfo}>
          <Text style={styles.leaderboardName}>{item.name}</Text>
          <Text style={styles.leaderboardStats}>
            {item.plantsGrown} plants grown
          </Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.ecoPoints}>{item.ecoPoints}</Text>
          <Text style={styles.pointsLabel}>eco points</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with fellow gardeners</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Users size={20} color={activeTab === 'feed' ? Colors.white : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <TrendingUp size={20} color={activeTab === 'leaderboard' ? Colors.white : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'feed' ? (
        <FlatList
          data={mockPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
        />
      ) : (
        <FlatList
          data={mockLeaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.leaderboardContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.white,
  },
  feedContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  postCard: {
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  plantTag: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  plantTagText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  postContent: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
    marginBottom: Spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  leaderboardContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  leaderboardCard: {
    marginBottom: Spacing.sm,
  },
  leaderboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankNumber: {
    ...Typography.body,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  leaderboardStats: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  ecoPoints: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  pointsLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});