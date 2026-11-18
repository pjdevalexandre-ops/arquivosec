-- ==============================================================================
-- ArquivoSec - PARTE 6: Mensagens Internas e Notificações em Tempo Real
-- Execute no SQL Editor do Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas rápidas de mensagens
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.internal_messages(receiver_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.internal_messages(sender_id, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- 1. Usuário pode ler mensagens que enviou ou que recebeu
DROP POLICY IF EXISTS "messages_select" ON public.internal_messages;
CREATE POLICY "messages_select" ON public.internal_messages
    FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- 2. Usuário autenticado pode enviar mensagens
DROP POLICY IF EXISTS "messages_insert" ON public.internal_messages;
CREATE POLICY "messages_insert" ON public.internal_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. Destinatário pode marcar sua mensagem como lida
DROP POLICY IF EXISTS "messages_update" ON public.internal_messages;
CREATE POLICY "messages_update" ON public.internal_messages
    FOR UPDATE USING (auth.uid() = receiver_id);
