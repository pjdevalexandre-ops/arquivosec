export type DocumentTypeSlug = 
  | 'oficio' 
  | 'contrato' 
  | 'nota-fiscal' 
  | 'processo' 
  | 'relatorio' 
  | 'outros' 
  | string;

export interface DocumentType {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_default: boolean;
  created_at?: string;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id?: string | null;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
  document_count?: number;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  folder_id?: string | null;
  type_id?: string | null;
  title: string;
  document_number?: string | null;
  document_date?: string | null;
  origin_sector?: string | null;
  notes?: string | null;
  
  // Storage
  file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  file_extension: string;
  
  // OCR
  ocr_text?: string | null;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  ocr_processed_at?: string | null;
  
  // Statuses
  is_favorite: boolean;
  is_trashed: boolean;
  trashed_at?: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Joined fields
  folder?: Folder | null;
  type?: DocumentType | null;
  tags?: Tag[];
  file_url?: string;
  snippet?: string;
}

export interface ShareLink {
  id: string;
  document_id: string;
  user_id: string;
  token: string;
  duration_label: '24h' | '7d' | '30d';
  expires_at: string;
  has_password?: boolean;
  view_count: number;
  max_views?: number | null;
  is_active: boolean;
  created_at: string;
  document?: DocumentItem;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  document_id?: string | null;
  action: 
    | 'upload' 
    | 'view' 
    | 'download' 
    | 'update' 
    | 'delete' 
    | 'restore' 
    | 'permanent_delete' 
    | 'share' 
    | 'revoke_share' 
    | 'favorite' 
    | 'unfavorite' 
    | 'move' 
    | 'tag';
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
  document?: DocumentItem | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  department: string;
  storage_limit_bytes: number; // e.g. 268435456000 (250 GB)
  storage_used_bytes: number;
  theme_preference: 'light' | 'dark' | 'system';
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  title: string;
  document_number?: string;
  document_date?: string;
  origin_sector?: string;
  folder_id?: string;
  type_id?: string;
  tag_ids: string[];
  notes?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing_ocr' | 'completed' | 'error';
  error_message?: string;
  created_document_id?: string;
}
