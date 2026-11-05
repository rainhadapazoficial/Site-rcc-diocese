-- SOLUÇÃO DEFINITIVA (NUCLEAR) PARA APAGAR EVENTOS E GALERIA
-- Segue o mesmo padrão que usou para desbloquear as notícias.

-- ---------------------------------------------------------
-- 1. TABELA DE EVENTOS (events)
-- ---------------------------------------------------------
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Remove TODAS as políticas
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.events', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Cria leitura pública e permissão de escrita apenas para Admin autenticado
CREATE POLICY "Public Read Events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated Events Access" 
ON public.events 
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');


-- ---------------------------------------------------------
-- 2. TABELA DE GALERIA (gallery)
-- ---------------------------------------------------------
ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;

-- Remove TODAS as políticas
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'gallery' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.gallery', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Cria leitura pública e permissão de escrita apenas para Admin autenticado
CREATE POLICY "Public Read Gallery"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated Gallery Access" 
ON public.gallery 
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- 3. STORAGE (Apagar imagens)
-- ---------------------------------------------------------
-- Garante que pode apagar arquivos dos buckets
DROP POLICY IF EXISTS "Universal Storage Delete" ON storage.objects;
CREATE POLICY "Universal Storage Delete" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id IN ('events', 'gallery', 'galeria-fotos', 'media'));
