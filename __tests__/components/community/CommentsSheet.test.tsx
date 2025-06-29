import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CommentsSheet } from '@/components/community/CommentsSheet';
import { usePostComments } from '@/hooks/usePostComments';
import { useAddComment } from '@/hooks/useAddComment';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Mock the hooks
jest.mock('@/hooks/usePostComments');
jest.mock('@/hooks/useAddComment');

// Mock the BottomSheetModal
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    BottomSheetModal: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
      }));
      return <>{props.children}</>;
    }),
    BottomSheetBackdrop: ({ children }) => <>{children}</>,
  };
});

const mockComments = [
  {
    id: 'comment-1',
    content: 'This is a test comment',
    created_at: '2023-01-01T12:00:00Z',
    user_id: 'user-1',
    username: 'johndoe',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  {
    id: 'comment-2',
    content: 'Another test comment',
    created_at: '2023-01-02T12:00:00Z',
    user_id: 'user-2',
    username: 'janedoe',
    avatar_url: 'https://example.com/avatar2.jpg',
  },
];

describe('CommentsSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock usePostComments
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
    
    // Mock useAddComment
    (useAddComment as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  it('renders comments correctly', () => {
    const { getByText } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    expect(getByText('This is a test comment')).toBeTruthy();
    expect(getByText('Another test comment')).toBeTruthy();
    expect(getByText('johndoe')).toBeTruthy();
    expect(getByText('janedoe')).toBeTruthy();
  });

  it('shows loading state', () => {
    (usePostComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: null,
    });

    const { getByTestId } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows empty state when no comments', () => {
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

    const { getByText } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    expect(getByText('No comments yet')).toBeTruthy();
    expect(getByText('Be the first to comment!')).toBeTruthy();
  });

  it('shows error state', () => {
    (usePostComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      error: new Error('Failed to load comments'),
    });

    const { getByText } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    expect(getByText('Failed to load comments')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('submits a comment', async () => {
    const mockMutate = jest.fn();
    (useAddComment as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    const { getByPlaceholderText, getByTestId } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'New comment');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(mockMutate).toHaveBeenCalledWith(
      { postId: 'post-1', content: 'New comment' },
      expect.any(Object)
    );
  });

  it('disables send button when comment is empty', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, '');

    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(true);
  });

  it('shows loading state when submitting comment', () => {
    (useAddComment as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
    });

    const { getByTestId } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={jest.fn()}
      />
    );

    expect(getByTestId('send-loading')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <CommentsSheet
        postId="post-1"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});