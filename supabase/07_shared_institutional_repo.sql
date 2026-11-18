-- ==============================================================================
-- ArquivoSec - PARTE 7: Repositório Institucional Unificado (Compartilhado)
-- Execute no SQL Editor do Supabase
-- ==============================================================================

-- 1. Pastas Institucionais (visíveis e gerenciáveis por toda a equipe autenticada)
DROP POLICY IF EXISTS "folders_select" ON public.folders;
CREATE POLICY "folders_select" ON public.folders
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "folders_insert" ON public.folders;
CREATE POLICY "folders_insert" ON public.folders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "folders_update" ON public.folders;
CREATE POLICY "folders_update" ON public.folders
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "folders_delete" ON public.folders;
CREATE POLICY "folders_delete" ON public.folders
    FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Documentos Oficiais (visíveis e acessíveis por toda a equipe autenticada)
DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_delete" ON public.documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Tipos Documentais Institucionais (Ofício, Contrato, Portaria, etc.)
DROP POLICY IF EXISTS "doc_types_select" ON public.document_types;
CREATE POLICY "doc_types_select" ON public.document_types
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_types_insert" ON public.document_types;
CREATE POLICY "doc_types_insert" ON public.document_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_types_update" ON public.document_types;
CREATE POLICY "doc_types_update" ON public.document_types
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_types_delete" ON public.document_types;
CREATE POLICY "doc_types_delete" ON public.document_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Tags e Associações de Tags
DROP POLICY IF EXISTS "tags_select" ON public.tags;
CREATE POLICY "tags_select" ON public.tags
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "tags_insert" ON public.tags;
CREATE POLICY "tags_insert" ON public.tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "tags_update" ON public.tags;
CREATE POLICY "tags_update" ON public.tags
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "tags_delete" ON public.tags;
CREATE POLICY "tags_delete" ON public.tags
    FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_tags_select" ON public.document_tags;
CREATE POLICY "doc_tags_select" ON public.document_tags
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_tags_insert" ON public.document_tags;
CREATE POLICY "doc_tags_insert" ON public.document_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doc_tags_delete" ON public.document_tags;
CREATE POLICY "doc_tags_delete" ON public.document_tags
    FOR DELETE USING (auth.role() = 'authenticated');
