export interface CommunityPost {
  id: string;
  user_id: string; // The student who asked
  user_name: string; // Display name
  user_avatar?: string;
  content: string;
  created_at: string;
  status: 'open' | 'resolved';
  tags?: string[];
  likes: number;
  liked_by_me?: boolean;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id?: string; // Null if from WhatsApp/Alumni not in DB
  user_name: string; // Name of the replier (Alumni)
  user_avatar?: string;
  content: string;
  created_at: string;
  source: 'web' | 'whatsapp';
  is_alumni: boolean;
}

export interface CreatePostDTO {
  content: string;
  tags?: string[];
}

export interface CreateReplyDTO {
  post_id: string;
  content: string;
}
