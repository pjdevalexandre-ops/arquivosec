-- ==============================================================================
-- ArquivoSec - Schema SQL Completo com Migrações, FTS e RLS
-- Sistema Seguro de Gestão Documental em Nuvem (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Tabela de Perfis de Usuário (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT DEFAULT 'Gabinete / Gestão Pública',
    storage_limit_bytes BIGINT NOT NULL DEFAULT 268435456000, -- 250 GB em bytes
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,
    theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Tipos de Documentos
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#0F4C5C',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_document_type UNIQUE (user_id, slug)
);

-- 4. Tabela de Pastas (Hierarquia em Árvore)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#0F4C5C',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

-- 6. Tabela de Documentos
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    document_number TEXT,
    document_date DATE,
    origin_sector TEXT,
    notes TEXT,
    
    -- Metadados de armazenamento no Cloudflare R2
    file_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_extension TEXT NOT NULL,
    
    -- OCR e Indexação de Conteúdo
    ocr_text TEXT,
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed', 'not_applicable')),
    ocr_processed_at TIMESTAMPTZ,
    
    -- Estados
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
    trashed_at TIMESTAMPTZ,
    
    -- Campo Full-Text Search (tsvector para português)
    fts tsvector,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tabela de Relacionamento Documentos <-> Tags
CREATE TABLE IF NOT EXISTS public.document_tags (
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (document_id, tag_id)
);

-- 8. Tabela de Compartilhamento Temporário de Documentos
CREATE TABLE IF NOT EXISTS public.share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    duration_label TEXT NOT NULL DEFAULT '24h',
    expires_at TIMESTAMPTZ NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    max_views INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ
);

-- 9. Tabela de Registro de Atividades e Auditoria
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN (
        'upload', 'view', 'download', 'update', 'delete', 
        'restore', 'permanent_delete', 'share', 'revoke_share', 
        'favorite', 'unfavorite', 'move', 'tag'
    )),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_id ON public.documents(type_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_trashed ON public.documents(is_trashed);
CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON public.documents(is_favorite);
CREATE INDEX IF NOT EXISTS idx_documents_document_date ON public.documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_fts ON public.documents USING GIN(fts);

CREATE INDEX IF NOT EXISTS idx_folders_user_parent ON public.folders(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_expires ON public.share_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, created_at DESC);

-- ==============================================================================
-- GATILHOS E FUNÇÕES: FTS (Busca Textual em Português)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.documents_fts_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.fts := 
        setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.document_number, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.origin_sector, '')), 'B') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.notes, '')), 'C') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.ocr_text, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_fts ON public.documents;
CREATE TRIGGER trg_documents_fts
    BEFORE INSERT OR UPDATE OF title, document_number, origin_sector, notes, ocr_text
    ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.documents_fts_trigger();

-- ==============================================================================
-- GATILHOS E FUNÇÕES: Atualização de timestamp 'updated_at'
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_folders_updated_at ON public.folders;
CREATE TRIGGER trg_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- GATILHO: Recalcular Armazenamento Usado no Perfil do Usuário
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_user_storage_usage()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
    total_bytes BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    SELECT COALESCE(SUM(file_size_bytes), 0)
    INTO total_bytes
    FROM public.documents
    WHERE user_id = target_user_id AND is_trashed = FALSE;

    UPDATE public.profiles
    SET storage_used_bytes = total_bytes,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_storage ON public.documents;
CREATE TRIGGER trg_update_user_storage
    AFTER INSERT OR UPDATE OF file_size_bytes, is_trashed OR DELETE
    ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_storage_usage();

-- ==============================================================================
-- GATILHO: Criação Automática de Perfil e Tipos Padrão ao Cadastrar Usuário
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Cria o perfil com cota de 250 GB
    INSERT INTO public.profiles (id, full_name, email, storage_limit_bytes, storage_used_bytes)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        268435456000, -- 250 GB
        0
    );

    -- Insere tipos padrão de documentos para o novo gestor público
    INSERT INTO public.document_types (user_id, name, slug, description, color, is_default)
    VALUES
        (NEW.id, 'Ofício', 'oficio', 'Comunicações oficiais entre órgãos públicos', '#0F4C5C', true),
        (NEW.id, 'Contrato', 'contrato', 'Contratos, aditivos e termos de ajuste', '#2563EB', true),
        (NEW.id, 'Nota Fiscal', 'nota-fiscal', 'Comprovantes fiscais e faturas de empenho', '#059669', true),
        (NEW.id, 'Processo', 'processo', 'Autos de processos administrativos', '#7C3AED', true),
        (NEW.id, 'Relatório', 'relatorio', 'Relatórios técnicos, prestação de contas e vistorias', '#D97706', true),
        (NEW.id, 'Outros', 'outros', 'Outros documentos digitalizados', '#6B7280', true);

    -- Insere pastas padrão essenciais
    INSERT INTO public.folders (user_id, name, color)
    VALUES
        (NEW.id, 'Gabinete', '#0F4C5C'),
        (NEW.id, 'Licitações e Contratos', '#2563EB'),
        (NEW.id, 'Financeiro e Contabilidade', '#059669'),
        (NEW.id, 'Recursos Humanos', '#7C3AED'),
        (NEW.id, 'Projetos e Obras', '#D97706');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- FUNÇÃO RPC: Busca Avançada Full-Text com Destaque (Snippet)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.search_documents(
    search_query TEXT,
    filter_folder_id UUID DEFAULT NULL,
    filter_type_id UUID DEFAULT NULL,
    filter_tag_id UUID DEFAULT NULL,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    document_number TEXT,
    document_date DATE,
    origin_sector TEXT,
    notes TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    folder_id UUID,
    type_id UUID,
    ocr_status TEXT,
    is_favorite BOOLEAN,
    created_at TIMESTAMPTZ,
    rank REAL,
    snippet TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.title,
        d.document_number,
        d.document_date,
        d.origin_sector,
        d.notes,
        d.file_name,
        d.file_size_bytes,
        d.mime_type,
        d.folder_id,
        d.type_id,
        d.ocr_status,
        d.is_favorite,
        d.created_at,
        ts_rank(d.fts, websearch_to_tsquery('portuguese', search_query)) AS rank,
        ts_headline('portuguese', coalesce(d.ocr_text, d.notes, d.title), websearch_to_tsquery('portuguese', search_query),
            'StartSel = <mark class="bg-amber-100 text-amber-900 font-semibold px-1 rounded">, StopSel = </mark>, MaxWords=35, MinWords=15'
        ) AS snippet
    FROM public.documents d
    WHERE d.user_id = auth.uid()
      AND d.is_trashed = FALSE
      AND (
          search_query IS NULL 
          OR search_query = '' 
          OR d.fts @@ websearch_to_tsquery('portuguese', search_query)
          OR d.title ILIKE '%' || search_query || '%'
          OR d.document_number ILIKE '%' || search_query || '%'
      )
      AND (filter_folder_id IS NULL OR d.folder_id = filter_folder_id)
      AND (filter_type_id IS NULL OR d.type_id = filter_type_id)
      AND (filter_tag_id IS NULL OR EXISTS (
          SELECT 1 FROM public.document_tags dt WHERE dt.document_id = d.id AND dt.tag_id = filter_tag_id
      ))
    ORDER BY rank DESC, d.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - ISOLAMENTO TOTAL POR USUÁRIO
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: profiles
CREATE POLICY "Usuário pode visualizar o próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuário pode atualizar o próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas: document_types
CREATE POLICY "Usuário visualiza seus tipos de documentos"
    ON public.document_types FOR SELECT
    USING (auth.uid() = user_id OR is_default = TRUE);

CREATE POLICY "Usuário gerencia seus tipos de documentos"
    ON public.document_types FOR ALL
    USING (auth.uid() = user_id);

-- Políticas: folders
CREATE POLICY "Usuário visualiza suas pastas"
    ON public.folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia suas pastas"
    ON public.folders FOR ALL
    USING (auth.uid() = user_id);

-- Políticas: tags
CREATE POLICY "Usuário visualiza suas tags"
    ON public.tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia suas tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id);

-- Políticas: documents
CREATE POLICY "Usuário visualiza seus documentos"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia seus documentos"
    ON public.documents FOR ALL
    USING (auth.uid() = user_id);

-- Políticas: document_tags
CREATE POLICY "Usuário visualiza suas tags de documentos"
    ON public.document_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_tags.document_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuário gerencia suas tags de documentos"
    ON public.document_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_tags.document_id AND d.user_id = auth.uid()
        )
    );

-- Políticas: share_links
CREATE POLICY "Usuário gerencia seus links de compartilhamento"
    ON public.share_links FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Acesso público a links compartilhados válidos"
    ON public.share_links FOR SELECT
    USING (is_active = TRUE AND expires_at > timezone('utc'::text, now()));

-- Políticas: activity_logs
CREATE POLICY "Usuário visualiza seus registros de auditoria"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Inserção de log de atividade pelo usuário"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
