-- ==============================================================================
-- ArquivoSec - PARTE 4: Row Level Security (RLS)
-- Execute após a Parte 3
-- ==============================================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs  ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- document_types
DROP POLICY IF EXISTS "doc_types_select" ON public.document_types;
CREATE POLICY "doc_types_select" ON public.document_types
    FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);

DROP POLICY IF EXISTS "doc_types_insert" ON public.document_types;
CREATE POLICY "doc_types_insert" ON public.document_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doc_types_update" ON public.document_types;
CREATE POLICY "doc_types_update" ON public.document_types
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "doc_types_delete" ON public.document_types;
CREATE POLICY "doc_types_delete" ON public.document_types
    FOR DELETE USING (auth.uid() = user_id);

-- folders
DROP POLICY IF EXISTS "folders_select" ON public.folders;
CREATE POLICY "folders_select" ON public.folders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "folders_insert" ON public.folders;
CREATE POLICY "folders_insert" ON public.folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "folders_update" ON public.folders;
CREATE POLICY "folders_update" ON public.folders
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "folders_delete" ON public.folders;
CREATE POLICY "folders_delete" ON public.folders
    FOR DELETE USING (auth.uid() = user_id);

-- tags
DROP POLICY IF EXISTS "tags_select" ON public.tags;
CREATE POLICY "tags_select" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tags_insert" ON public.tags;
CREATE POLICY "tags_insert" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tags_update" ON public.tags;
CREATE POLICY "tags_update" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tags_delete" ON public.tags;
CREATE POLICY "tags_delete" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);

-- documents
DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_delete" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- document_tags (usa subquery IN para evitar EXISTS em FOR ALL)
DROP POLICY IF EXISTS "doc_tags_select" ON public.document_tags;
CREATE POLICY "doc_tags_select" ON public.document_tags
    FOR SELECT USING (
        auth.uid() IN (
            SELECT d.user_id FROM public.documents d
            WHERE d.id = document_tags.document_id
        )
    );

DROP POLICY IF EXISTS "doc_tags_insert" ON public.document_tags;
CREATE POLICY "doc_tags_insert" ON public.document_tags
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT d.user_id FROM public.documents d
            WHERE d.id = document_tags.document_id
        )
    );

DROP POLICY IF EXISTS "doc_tags_delete" ON public.document_tags;
CREATE POLICY "doc_tags_delete" ON public.document_tags
    FOR DELETE USING (
        auth.uid() IN (
            SELECT d.user_id FROM public.documents d
            WHERE d.id = document_tags.document_id
        )
    );

-- share_links (dono gerencia; acesso publico para links validos)
DROP POLICY IF EXISTS "share_links_owner_select" ON public.share_links;
CREATE POLICY "share_links_owner_select" ON public.share_links
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "share_links_insert" ON public.share_links;
CREATE POLICY "share_links_insert" ON public.share_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "share_links_update" ON public.share_links;
CREATE POLICY "share_links_update" ON public.share_links
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "share_links_delete" ON public.share_links;
CREATE POLICY "share_links_delete" ON public.share_links
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "share_links_public" ON public.share_links;
CREATE POLICY "share_links_public" ON public.share_links
    FOR SELECT USING (is_active = TRUE AND expires_at > now());

-- activity_logs
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;
CREATE POLICY "activity_logs_insert" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
