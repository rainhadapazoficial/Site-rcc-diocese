-- Adicionar coluna link_inscricao na tabela calendario_diocesano (opcional, para coluna dedicada)
ALTER TABLE public.calendario_diocesano 
ADD COLUMN IF NOT EXISTS link_inscricao TEXT;

