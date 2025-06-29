import React from 'react';
import { render } from '@testing-library/react-native';
import { CommentItem } from '@/components/community/CommentItem';

const mockComment = {
  id: 'comment-1',
  content: 'This is a test comment',
  created_at: '2023-01-01T12:00:00Z',
  user_id: 'user-1',
  username: 'johndoe',
  avatar_url: 'https://example.com/avatar.jpg',
};

describe('CommentItem', () => {
  it('renders correctly with all props', () => {
    const { getByText } = render(<CommentItem comment={mockComment} />);

    expect(getByText('johndoe')).toBeTruthy();
    expect(getByText('This is a test comment')).toBeTruthy();
    expect(getByText(/ago/)).toBeTruthy(); // Should contain "ago" in the timestamp
  });

  it('handles missing avatar gracefully', () => {
    const { getByTestId } = render(
      <CommentItem
        comment={{
          ...mockComment,
          avatar_url: null,
        }}
      />
    );

    const avatar = getByTestId('comment-avatar');
    expect(avatar).toBeTruthy();
    // Should use default avatar URL
    expect(avatar.props.source.uri).toContain('pexels');
  });

  it('formats date correctly', () => {
    const { getByText } = render(
      <CommentItem
        comment={{
          ...mockComment,
          created_at: new Date().toISOString(), // Use current date
        }}
      />
    );

    // Should show "less than a minute ago"
    expect(getByText(/less than a minute ago/i)).toBeTruthy();
  });

  it('renders long comments correctly', () => {
    const longComment = 'This is a very long comment that should still be displayed correctly. '.repeat(10);
    
    const { getByText } = render(
      <CommentItem
        comment={{
          ...mockComment,
          content: longComment,
        }}
      />
    );

    expect(getByText(longComment)).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(<CommentItem comment={mockComment} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});