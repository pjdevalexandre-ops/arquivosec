-- ==============================================================================
-- ArquivoSec - PARTE 2: Índices
-- Execute após a Parte 1
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_user_id     ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id   ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_id     ON public.documents(type_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_trashed  ON public.documents(is_trashed);
CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON public.documents(is_favorite);
CREATE INDEX IF NOT EXISTS idx_documents_date        ON public.documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_created_at  ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_fts         ON public.documents USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_folders_user_parent   ON public.folders(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_user             ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token     ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_expires   ON public.share_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user    ON public.activity_logs(user_id, created_at DESC);
