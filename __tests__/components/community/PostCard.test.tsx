import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostCard } from '@/components/community/PostCard';

const mockPost = {
  id: 'post-1',
  user_id: 'user-1',
  username: 'johndoe',
  avatar_url: 'https://example.com/avatar.jpg',
  photo_url: 'https://example.com/photo.jpg',
  caption: 'Test caption',
  likes_count: 10,
  comments_count: 5,
  created_at: '2023-01-01T12:00:00Z',
};

describe('PostCard', () => {
  it('renders correctly with all props', () => {
    const { getByText, getByTestId } = render(
      <PostCard 
        post={mockPost}
        onLike={jest.fn()}
        onComment={jest.fn()}
        onShare={jest.fn()}
        isLiked={false}
      />
    );

    expect(getByText('johndoe')).toBeTruthy();
    expect(getByText('Test caption')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onLike when like button is pressed', () => {
    const mockOnLike = jest.fn();
    const { getByTestId } = render(
      <PostCard 
        post={mockPost}
        onLike={mockOnLike}
        onComment={jest.fn()}
        onShare={jest.fn()}
        isLiked={false}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);
    expect(mockOnLike).toHaveBeenCalledWith('post-1');
  });

  it('calls onComment when comment button is pressed', () => {
    const mockOnComment = jest.fn();
    const { getByTestId } = render(
      <PostCard 
        post={mockPost}
        onLike={jest.fn()}
        onComment={mockOnComment}
        onShare={jest.fn()}
        isLiked={false}
      />
    );

    const commentButton = getByTestId('comment-button');
    fireEvent.press(commentButton);
    expect(mockOnComment).toHaveBeenCalledWith('post-1');
  });

  it('calls onShare when share button is pressed', () => {
    const mockOnShare = jest.fn();
    const { getByTestId } = render(
      <PostCard 
        post={mockPost}
        onLike={jest.fn()}
        onComment={jest.fn()}
        onShare={mockOnShare}
        isLiked={false}
      />
    );

    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);
    expect(mockOnShare).toHaveBeenCalledWith('post-1');
  });

  it('renders liked state correctly', () => {
    const { getByTestId } = render(
      <PostCard 
        post={mockPost}
        onLike={jest.fn()}
        onComment={jest.fn()}
        onShare={jest.fn()}
        isLiked={true}
      />
    );

    const likeIcon = getByTestId('like-icon');
    expect(likeIcon.props.fill).toBe(Colors.error);
  });

  it('formats date correctly', () => {
    const { getByText } = render(
      <PostCard 
        post={{
          ...mockPost,
          created_at: new Date().toISOString() // Use current date
        }}
        onLike={jest.fn()}
        onComment={jest.fn()}
        onShare={jest.fn()}
        isLiked={false}
      />
    );

    // Should show "less than a minute ago"
    expect(getByText(/less than a minute ago/i)).toBeTruthy();
  });

  it('handles missing avatar gracefully', () => {
    const { getByTestId } = render(
      <PostCard 
        post={{
          ...mockPost,
          avatar_url: null
        }}
        onLike={jest.fn()}
        onComment={jest.fn()}
        onShare={jest.fn()}
        isLiked={false}
      />
    );

    const avatar = getByTestId('user-avatar');
    expect(avatar).toBeTruthy();
  });
});