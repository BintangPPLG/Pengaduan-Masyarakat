export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export type Report = {
  id: number;
  header: string;
  body: string;
  image: string | null;
  images: string | string[] | null; // JSON array from backend or already parsed
  status: string;
  created_at: string;
  username: string;
  user_id?: number;
  category_name: string;
  rejected_reason?: string | null;
};

export type Comment = {
  id: number;
  user_id?: number;
  username: string;
  comment: string;
  created_at: string;
  updated_at?: string | null;
  parent_id?: number | null;
  replies?: Comment[];
};

export type Category = {
  id: number;
  category_name: string;
};
