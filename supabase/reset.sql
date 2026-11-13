-- ==============================================================================
-- ArquivoSec - Script de Limpeza / Reset Total do Banco de Dados
-- Use este script no SQL Editor do Supabase para zerar todo o acervo
-- e começar a utilizar o sistema em produção do zero absoluto.
-- ==============================================================================

-- 1. Remove com segurança todos os registros de documentos, compartilhamentos e logs
TRUNCATE TABLE public.document_tags CASCADE;
TRUNCATE TABLE public.share_links CASCADE;
TRUNCATE TABLE public.activity_logs CASCADE;
TRUNCATE TABLE public.documents CASCADE;

-- 2. Zera o contador de armazenamento utilizado em todos os perfis
UPDATE public.profiles
SET storage_used_bytes = 0,
    updated_at = timezone('utc'::text, now());

-- 3. Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados do ArquivoSec zerado com sucesso! Pronto para início do acervo oficial.';
END $$;
