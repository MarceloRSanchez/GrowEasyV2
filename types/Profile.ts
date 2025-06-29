export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
}

export interface UpdateProfileParams {
  display_name?: string;
  avatar_url?: string;
}