import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { usePostComments } from '@/hooks/usePostComments';
import { useAddComment } from '@/hooks/useAddComment';
import { Send, X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';

interface CommentsSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
  autoFocus?: boolean;
}

export function CommentsSheet({ postId, isVisible, onClose, autoFocus = false }: CommentsSheetProps) {
  const [comment, setComment] = useState('');
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = ['70%'];
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePostComments(postId);
  
  const addComment = useAddComment();
  
  // Flatten the pages of comments
  const comments = data?.pages.flatMap(page => page.comments) || [];
  
  // Handle submitting a new comment
  const handleSubmit = () => {
    if (!comment.trim()) return;
    
    addComment.mutate(
      { postId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment('');
        },
      }
    );
  };
  
  // Present the sheet when isVisible changes
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
      
      // Auto focus the input if requested
      if (autoFocus) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible, autoFocus]);
  
  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);
  
  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  
  // Load more comments when reaching the end
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  // Render footer with loading indicator
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading more comments...</Text>
        </View>
      );
    }
    return null;
  };
  
  // Render empty state
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Failed to load comments</Text>
          <TouchableOpacity onPress={() => fetchNextPage()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No comments yet</Text>
        <Text style={styles.emptySubtext}>Be the first to comment!</Text>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={({ item }) => <CommentItem comment={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          style={styles.inputContainer}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !comment.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!comment.trim() || addComment.isLoading}
          >
            {addComment.isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Send size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  retryText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
});