import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { CommentsSheet } from '@/components/community/CommentsSheet';
import { usePostComments } from '@/hooks/usePostComments';
import { useAddComment } from '@/hooks/useAddComment';

// Mock the hooks
jest.mock('@/hooks/usePostComments');
jest.mock('@/hooks/useAddComment');

const mockComments = [
  {
    id: 'comment-1',
    content: 'This is a test comment',
    created_at: '2023-01-01T12:00:00Z',
    user_id: 'user-1',
    username: 'johndoe',
    avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'comment-2',
    content: 'Another test comment that is a bit longer to see how it wraps on multiple lines',
    created_at: '2023-01-02T12:00:00Z',
    user_id: 'user-2',
    username: 'janedoe',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'comment-3',
    content: 'A third comment to show scrolling behavior',
    created_at: '2023-01-03T12:00:00Z',
    user_id: 'user-3',
    username: 'bobsmith',
    avatar_url: null,
  },
];

const meta: Meta<typeof CommentsSheet> = {
  title: 'Components/CommentsSheet',
  component: CommentsSheet,
};

export default meta;

type Story = StoryObj<typeof meta>;

function CommentsSheetDemo() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Mock the hooks
  (usePostComments as jest.Mock).mockReturnValue({
    data: {
      pages: [
        {
          comments: mockComments,
          nextPage: null,
        },
      ],
    },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    error: null,
  });
  
  (useAddComment as jest.Mock).mockReturnValue({
    mutate: jest.fn((params, options) => {
      setTimeout(() => {
        options?.onSuccess?.();
      }, 1000);
    }),
    isLoading: false,
  });
  
  return (
    <View style={styles.container}>
      <Button
        title="Open Comments"
        onPress={() => setIsVisible(true)}
      />
      
      <CommentsSheet
        postId="post-1"
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
}

export const Default: Story = {
  render: () => <CommentsSheetDemo />,
};

export const Loading: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    
    (usePostComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: null,
    });
    
    return (
      <View style={styles.container}>
        <Button
          title="Open Comments (Loading)"
          onPress={() => setIsVisible(true)}
        />
        
        <CommentsSheet
          postId="post-1"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </View>
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    
    (usePostComments as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            comments: [],
            nextPage: null,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: null,
    });
    
    return (
      <View style={styles.container}>
        <Button
          title="Open Comments (Empty)"
          onPress={() => setIsVisible(true)}
        />
        
        <CommentsSheet
          postId="post-1"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </View>
    );
  },
};

export const Error: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    
    (usePostComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: new Error('Failed to load comments'),
    });
    
    return (
      <View style={styles.container}>
        <Button
          title="Open Comments (Error)"
          onPress={() => setIsVisible(true)}
        />
        
        <CommentsSheet
          postId="post-1"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </View>
    );
  },
};

export const AddingComment: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    
    (usePostComments as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            comments: mockComments,
            nextPage: null,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: null,
    });
    
    (useAddComment as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
    });
    
    return (
      <View style={styles.container}>
        <Button
          title="Open Comments (Adding)"
          onPress={() => setIsVisible(true)}
        />
        
        <CommentsSheet
          postId="post-1"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </View>
    );
  },
};

export const Pagination: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Create 30 mock comments
    const manyComments = Array.from({ length: 30 }, (_, i) => ({
      id: `comment-${i + 1}`,
      content: `This is comment #${i + 1}`,
      created_at: new Date(2023, 0, i + 1).toISOString(),
      user_id: `user-${i % 3 + 1}`,
      username: ['johndoe', 'janedoe', 'bobsmith'][i % 3],
      avatar_url: i % 2 === 0 ? 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400' : null,
    }));
    
    (usePostComments as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            comments: manyComments.slice(0, 20),
            nextPage: 20,
          },
          {
            comments: manyComments.slice(20),
            nextPage: null,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: jest.fn(),
      error: null,
    });
    
    return (
      <View style={styles.container}>
        <Button
          title="Open Comments (Pagination)"
          onPress={() => setIsVisible(true)}
        />
        
        <CommentsSheet
          postId="post-1"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});