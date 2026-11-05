-- ============================================
-- HISTÓRICO DE COORDENADORES POR GESTÃO (MINISTÉRIOS)
-- RCC Diocese Sinop
-- ============================================

-- Tabela: histórico de coordenadores por ministério e gestão
CREATE TABLE IF NOT EXISTS public.ministerio_coordinator_history (
    id BIGSERIAL PRIMARY KEY,
    ministerio_id BIGINT NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    gestao TEXT NOT NULL,
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar por ministério
CREATE INDEX IF NOT EXISTS idx_ministerio_coordinator_history_min_id
    ON public.ministerio_coordinator_history(ministerio_id);

-- Ordenação: gestões mais recentes primeiro (ordem menor = mais recente)
CREATE INDEX IF NOT EXISTS idx_ministerio_coordinator_history_ordem
    ON public.ministerio_coordinator_history(ministerio_id, ordem);

-- RLS
ALTER TABLE public.ministerio_coordinator_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ministry coordinator history"
    ON public.ministerio_coordinator_history FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow admin full access on ministry coordinator history"
    ON public.ministerio_coordinator_history FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.ministerio_coordinator_history IS 'Histórico de coordenadores por gestão em cada ministério';
COMMENT ON COLUMN public.ministerio_coordinator_history.gestao IS 'Período da gestão, ex: 2020-2022, 2022-2024, 2024-atual';
