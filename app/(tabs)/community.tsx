import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/FeedSkeleton';
import { EmptyFeed } from '@/components/community/EmptyFeed';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { FlashList } from '@shopify/flash-list';
import {
  Heart,
  Plus,
  Trophy,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
  changed: ViewToken[];
};

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  ecoPoints: number;
  plantsGrown: number;
  rank: number;
}

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
  const [showError, setShowError] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useFeedPosts();
  
  // Track post views for analytics
  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: ViewableItemsChangedInfo) => {
      viewableItems.forEach(viewableItem => {
        if (viewableItem.isViewable && viewableItem.item && viewableItem.item.id) {
          // Log post view analytics
          console.log('Analytics: post_viewed', { postId: viewableItem.item.id });
        }
      });
    },
    []
  );
  
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };
  
  const viewabilityConfigCallbackPairs = React.useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);
  
  // Log feed opened analytics
  useEffect(() => {
    console.log('Analytics: feed_opened');
    
    // Set loaded state after initial data fetch
    if (!isLoading && data) {
      setIsLoaded(true);
    }
  }, []);
  
  useEffect(() => {
    if (!isLoading && data) {
      setIsLoaded(true);
    }
  }, [isLoading, data]);

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleRetry = () => {
    setShowError(false);
    refetch();
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} color="#FFD700" />;
      case 2:
        return <Trophy size={20} color="#C0C0C0" />;
      case 3:
        return <Trophy size={20} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

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

  // Prepare posts data for FlashList
  const posts = data?.pages.flatMap((page: any) => page.posts) || [];
  const isEmpty = !isLoading && posts.length === 0;

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

      {/* Error Toast */}
      {error && showError && (
        <ErrorToast
          message={error.message || "Couldn't load feed. Please try again."}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Floating Action Button */}
      {isLoaded && activeTab === 'feed' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/community/new')}
          accessibilityLabel="Create new post"
          accessibilityRole="button"
        >
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      )}
      
      {/* Content */}
      {activeTab === 'feed' ? (
        isLoading ? (
          <FeedSkeleton count={5} />
        ) : isEmpty ? (
          <EmptyFeed onRefresh={handleRefresh} />
        ) : (
          <FlashList
            data={posts}
            renderItem={({ item }: { item: any }) => (
              <PostCard
                post={item}
                onLike={handleLike}
                onComment={(id) => console.log('Comment on post', id)}
                onShare={(id) => console.log('Share post', id)}
                isLiked={likedPosts.has(item.id)}
              />
            )}
            estimatedItemSize={400}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.feedContainer}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingMore}>
                  <Text style={styles.loadingMoreText}>Loading more posts...</Text>
                </View>
              ) : null
            }
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          />
        )
      ) : (
        <FlashList
          data={mockLeaderboard}
          renderItem={renderLeaderboardItem}
          estimatedItemSize={100}
          keyExtractor={(item) => item.id}
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
    paddingTop: Spacing.sm,
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
  loadingMore: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  loadingMoreText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
});