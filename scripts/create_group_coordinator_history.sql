-- ============================================
-- HISTÓRICO DE COORDENADORES POR GESTÃO
-- Grupos de Oração - RCC Diocese Sinop
-- ============================================

-- Tabela: histórico de coordenadores por grupo e gestão
CREATE TABLE IF NOT EXISTS public.group_coordinator_history (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    gestao TEXT NOT NULL,
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar por grupo
CREATE INDEX IF NOT EXISTS idx_group_coordinator_history_group_id
    ON public.group_coordinator_history(group_id);

-- Ordenação: gestões mais recentes primeiro (ordem menor = mais recente)
CREATE INDEX IF NOT EXISTS idx_group_coordinator_history_ordem
    ON public.group_coordinator_history(group_id, ordem);

-- RLS
ALTER TABLE public.group_coordinator_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on coordinator history"
    ON public.group_coordinator_history FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow admin full access on coordinator history"
    ON public.group_coordinator_history FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.group_coordinator_history IS 'Histórico de coordenadores por gestão em cada grupo de oração';
COMMENT ON COLUMN public.group_coordinator_history.gestao IS 'Período da gestão, ex: 2020-2022, 2022-2024, 2024-atual';
