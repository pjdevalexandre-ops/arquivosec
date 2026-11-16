-- ==============================================================================
-- ArquivoSec - PARTE 3: Funções e Gatilhos
-- Execute após a Parte 2
-- ==============================================================================

-- Atualização automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_folders_updated_at ON public.folders;
CREATE TRIGGER trg_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Full-Text Search em português
CREATE OR REPLACE FUNCTION public.documents_fts_trigger()
RETURNS TRIGGER AS $$
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
    BEFORE INSERT OR UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.documents_fts_trigger();

-- Recalcular armazenamento usado no perfil
CREATE OR REPLACE FUNCTION public.update_user_storage_usage()
RETURNS TRIGGER AS $$
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
    WHERE user_id = target_user_id
      AND is_trashed = FALSE;

    UPDATE public.profiles
    SET storage_used_bytes = total_bytes,
        updated_at = now()
    WHERE id = target_user_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_storage ON public.documents;
CREATE TRIGGER trg_update_user_storage
    AFTER INSERT OR UPDATE OR DELETE
    ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_user_storage_usage();

-- Criação automática de perfil ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, storage_limit_bytes, storage_used_bytes)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        268435456000,
        0
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.document_types (user_id, name, slug, description, color, is_default)
    VALUES
        (NEW.id, 'Oficio', 'oficio', 'Comunicacoes oficiais entre orgaos publicos', '#0F4C5C', true),
        (NEW.id, 'Contrato', 'contrato', 'Contratos, aditivos e termos de ajuste', '#2563EB', true),
        (NEW.id, 'Nota Fiscal', 'nota-fiscal', 'Comprovantes fiscais e faturas de empenho', '#059669', true),
        (NEW.id, 'Processo', 'processo', 'Autos de processos administrativos', '#7C3AED', true),
        (NEW.id, 'Relatorio', 'relatorio', 'Relatorios tecnicos e prestacao de contas', '#D97706', true),
        (NEW.id, 'Outros', 'outros', 'Outros documentos digitalizados', '#6B7280', true)
    ON CONFLICT (user_id, slug) DO NOTHING;

    INSERT INTO public.folders (user_id, name, color)
    VALUES
        (NEW.id, 'Gabinete', '#0F4C5C'),
        (NEW.id, 'Licitacoes e Contratos', '#2563EB'),
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

-- Funcao RPC de busca full-text
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
        ts_rank(d.fts, websearch_to_tsquery('portuguese', search_query))::REAL AS rank,
        ts_headline(
            'portuguese',
            coalesce(d.ocr_text, d.notes, d.title),
            websearch_to_tsquery('portuguese', search_query),
            'StartSel=[, StopSel=], MaxWords=35, MinWords=15'
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
      AND (filter_tag_id IS NULL OR d.id IN (
          SELECT dt.document_id FROM public.document_tags dt
          WHERE dt.tag_id = filter_tag_id
      ))
    ORDER BY rank DESC, d.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
