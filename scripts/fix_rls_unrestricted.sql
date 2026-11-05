-- SCRIPT DE DESBLOQUEIO TOTAL (POSTS)
-- Use este script se as notícias ainda não estiverem entrando.

-- 1. Desabilita RLS temporariamente para garantir que o banco aceita dados
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- 2. Limpa todas as políticas antigas
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.posts', pol.policyname);
    END LOOP;
END $$;

-- 3. Habilita RLS novamente
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. Cria política de leitura pública e escrita restrita a autenticados
CREATE POLICY "Public Read Posts"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated Manage Posts" 
ON public.posts 
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 5. Garante que os logs sejam restritos a administradores autenticados
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Logs All Access Authenticated" ON public.sync_logs;
DROP POLICY IF EXISTS "Unrestricted Access to Logs" ON public.sync_logs;
CREATE POLICY "Authenticated Access to Logs" ON public.sync_logs FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
