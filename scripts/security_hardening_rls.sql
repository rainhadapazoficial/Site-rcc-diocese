-- ============================================================================
-- SCRIPT DE BLINDAGEM DE SEGURANÇA E RLS — RCC DIOCESE DE SINOP
-- Correções: CRIT-01 (exec_raw_sql), CRIT-03 (RLS), HIGH-05 (Storage), MED-04 (RPC)
-- ============================================================================

-- 1. [CRIT-01] Remover a função RPC de execução arbitrária de SQL (caso ainda exista)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'exec_raw_sql'
    ) THEN
        EXECUTE 'DROP FUNCTION public.exec_raw_sql(text)';
    END IF;
END $$;

-- 2. [MED-04] Garantir tabela page_views e função RPC atômica increment_page_view
CREATE TABLE IF NOT EXISTS public.page_views (
    slug TEXT PRIMARY KEY,
    views BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'page_views' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.page_views', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Allow public read page_views"
    ON public.page_views FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated manage page_views"
    ON public.page_views FOR ALL TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.increment_page_view(page_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF page_slug IS NULL OR length(trim(page_slug)) = 0 OR length(page_slug) > 160 THEN
        RETURN;
    END IF;

    INSERT INTO public.page_views (slug, views, updated_at)
    VALUES (page_slug, 1, NOW())
    ON CONFLICT (slug)
    DO UPDATE SET views = public.page_views.views + 1, updated_at = NOW();
END;
$$;

-- 3. [CRIT-03] Blindar tabelas com dados pessoais (LGPD): prayer_requests e contact_submissions
DO $$
DECLARE
    tbl text;
    pol record;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['prayer_requests', 'contact_submissions']
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public')
            LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl);
            END LOOP;

            -- Visitantes podem apenas ENVIAR (INSERT), nunca ler ou apagar
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)',
                tbl || '_public_insert', tbl
            );

            -- Apenas administradores autenticados podem LER, EDITAR e APAGAR
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.role() = ''authenticated'')',
                tbl || '_auth_select', tbl
            );
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
                tbl || '_auth_update', tbl
            );
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.role() = ''authenticated'')',
                tbl || '_auth_delete', tbl
            );
        END IF;
    END LOOP;
END $$;

-- 4. [CRIT-03] Blindar tabelas exclusivas de sistema/admin: system_settings e sync_logs
DO $$
DECLARE
    tbl text;
    pol record;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['system_settings', 'sync_logs']
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('REVOKE ALL ON public.%I FROM anon', tbl);
            FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public')
            LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl);
            END LOOP;

            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
                tbl || '_auth_all', tbl
            );
        END IF;
    END LOOP;
END $$;

-- 5. [CRIT-03] Padronizar tabelas de conteúdo público (SELECT público / Escrita restrita a authenticated)
DO $$
DECLARE
    tbl text;
    pol record;
    public_tables text[] := ARRAY[
        'posts',
        'events',
        'groups',
        'group_coordinator_history',
        'ministerios',
        'ministerio_coordinator_history',
        'foranias',
        'custom_pages',
        'site_settings',
        'calendario_diocesano',
        'conselho_mandatos',
        'conselho_membros',
        'festa_rei_jesus_edicoes',
        'festa_rei_jesus_editions',
        'gallery',
        'podcasts'
    ];
BEGIN
    FOREACH tbl IN ARRAY public_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public')
            LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl);
            END LOOP;

            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
                tbl || '_public_read', tbl
            );
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.role() = ''authenticated'')',
                tbl || '_auth_insert', tbl
            );
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
                tbl || '_auth_update', tbl
            );
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.role() = ''authenticated'')',
                tbl || '_auth_delete', tbl
            );
        END IF;
    END LOOP;
END $$;

-- 6. [HIGH-05] Blindar Buckets 'media' e 'rcc-imagens' no Supabase Storage (limite de 5MB e apenas imagens seguras)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rcc-imagens', 'rcc-imagens', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

UPDATE storage.buckets
SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'media';

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media" ON storage.objects;
DROP POLICY IF EXISTS "Universal Storage Delete" ON storage.objects;

CREATE POLICY "Public Read Media"
    ON storage.objects FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('media', 'rcc-imagens', 'galeria-fotos', 'events', 'gallery'));

CREATE POLICY "Admin Insert Media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('media', 'rcc-imagens', 'galeria-fotos') AND auth.role() = 'authenticated');

CREATE POLICY "Admin Update Media"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id IN ('media', 'rcc-imagens', 'galeria-fotos') AND auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id IN ('media', 'rcc-imagens', 'galeria-fotos', 'events', 'gallery') AND auth.role() = 'authenticated');

