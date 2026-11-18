-- ==============================================================================
-- ArquivoSec - PARTE 5: Controle de Acesso (Administrador) e Monitoramento Online
-- Execute no SQL Editor do Supabase
-- ==============================================================================

-- 1. Adicionar colunas de nível de acesso e presença na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'gestor', 'operador')),
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS current_page TEXT DEFAULT 'Painel';

-- 2. Garantir que todos os usuários existentes sejam definidos como admin inicialmente
UPDATE public.profiles SET role = 'admin' WHERE role IS NULL;

-- 3. Função segura para verificar se o usuário autenticado é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar políticas RLS de profiles:
-- Usuário comum vê apenas o seu perfil; Administrador pode ver todos os perfis para gestão da equipe
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Administrador pode atualizar perfis de outros usuários (ex: mudar cargo, permissão)
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 5. Atualizar políticas RLS de activity_logs:
-- Administrador pode ver todo o histórico de auditoria de todos os usuários
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 6. Adicionar relacionamento de chave estrangeira de activity_logs com profiles (para JOINs perfeitos)
-- Primeiro verifica se existe constraint; se não, adiciona
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_activity_logs_profile'
    ) THEN
        ALTER TABLE public.activity_logs
        ADD CONSTRAINT fk_activity_logs_profile
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
