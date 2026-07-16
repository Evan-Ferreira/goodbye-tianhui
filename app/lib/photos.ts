export type Photo = {
  id: string;
  author: string;
  description: string;
  storage_path: string;
  created_at: string;
};

/** Supabase Storage bucket that holds the uploaded gallery images. */
export const PHOTO_BUCKET = "memories";
