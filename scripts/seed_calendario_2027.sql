-- Seed: Calendário RCC Sinop & RCC Brasil 2027
-- Categorias: diocesano (azul), estadual (vermelho), nacional (cinza)

DELETE FROM public.calendario_diocesano WHERE ano = 2027;

INSERT INTO public.calendario_diocesano (titulo, data_inicio, data_fim, mes, ano, categoria, descricao) VALUES

-- JANEIRO
('Escola N. de Formação de Líderes e Missionários (ENFLM)', '2027-01-09', '2027-01-19', 1, 2027, 'nacional', 'Local: São José dos Campos (SP)'),
('RENASEM — Retiro Nacional de Seminaristas', '2027-01-11', '2027-01-15', 1, 2027, 'nacional', 'Local: Goiânia (GO)'),
('Assembleia Ordinária do Conselho Nacional', '2027-01-16', '2027-01-20', 1, 2027, 'nacional', 'Local: Aparecida (SP)'),
('Escola Nacional de Pregação', '2027-01-16', '2027-01-20', 1, 2027, 'nacional', 'Local: Lorena (SP)'),
('Encontro Nacional de Formação (ENF 2027)', '2027-01-20', '2027-01-24', 1, 2027, 'nacional', 'Local: Aparecida (SP)'),

-- FEVEREIRO
('Vem Louvar — Retiro de Carnaval Diocesano', '2027-02-06', '2027-02-09', 2, 2027, 'diocesano', 'Encontros e Retiros de Carnaval em toda a Diocese de Sinop'),
('Retiros de Carnaval (RCC Brasil)', '2027-02-06', '2027-02-09', 2, 2027, 'nacional', 'Instâncias da RCC em todo o Brasil'),
('Semana Jubilar – 60 anos de RCC no mundo!', '2027-02-15', '2027-02-21', 2, 2027, 'nacional', 'Celebração comemorativa nos Grupos de Oração de todo o Brasil'),
('Assembleia do Conselho Estadual', '2027-02-20', '2027-02-21', 2, 2027, 'estadual', 'Reunião de lideranças da RCC Mato Grosso'),

-- MARÇO
('Reunião do Conselho Diocesano', '2027-03-06', '2027-03-07', 3, 2027, 'diocesano', 'Reunião de coordenadores e lideranças da Diocese de Sinop'),
('Domingo de Páscoa', '2027-03-28', NULL, 3, 2027, 'diocesano', 'Celebração da Ressurreição do Senhor'),

-- ABRIL
('Oficina para Condutores de Oração', '2027-04-03', '2027-04-04', 4, 2027, 'diocesano', 'Formação diocesana para servos condutores de Grupo de Oração'),
('Consagração ao Espírito Santo (Livro Jean-Philippe Roullier)', '2027-04-07', '2027-05-06', 4, 2027, 'nacional', 'Jornada espiritual de 30 dias pelas instâncias da RCC'),
('Encontro Estadual de Formação (EEF 2027)', '2027-04-24', '2027-04-25', 4, 2027, 'estadual', 'Encontro de formação para ministérios e lideranças da RCC Mato Grosso'),
('Encontro Nacional de Presidências Diocesanas', '2027-04-30', '2027-05-02', 4, 2027, 'nacional', 'Local: Sede Nacional da RCCBRASIL (SP)'),

-- MAIO
('Projeto 1º de Maio (PdR’s)', '2027-05-01', NULL, 5, 2027, 'nacional', 'Ação evangelizadora com Profissionais do Reino'),
('Novena de Pentecostes', '2027-05-07', '2027-05-15', 5, 2027, 'nacional', 'Preparação espiritual em todas as instâncias e Grupos de Oração'),
('Jubileu 60 anos da RCC – em Assis', '2027-05-12', '2027-05-20', 5, 2027, 'nacional', 'Local: Assis - Itália. Celebração mundial do Jubileu de Diamante'),
('Encontros de Pentecostes', '2027-05-15', '2027-05-16', 5, 2027, 'diocesano', 'Cenáculos e celebrações de Pentecostes na Diocese de Sinop'),
('Solenidade de Pentecostes', '2027-05-16', NULL, 5, 2027, 'diocesano', 'Festa solene da efusão do Espírito Santo'),

-- JUNHO
('Ministerialidade Orgânica', '2027-06-05', '2027-06-06', 6, 2027, 'diocesano', 'Formação diocesana de articulação ministerial'),
('Simpósio Grupo de Oração – Lugar de Vivência Fraterna', '2027-06-08', '2027-06-10', 6, 2027, 'nacional', 'Formato: Online'),
('Festa da Unidade – SBCC', '2027-06-17', '2027-06-20', 6, 2027, 'nacional', 'Local: Cachoeira Paulista (SP)'),

-- JULHO
('Congresso Diocesano Jovem', '2027-07-03', '2027-07-04', 7, 2027, 'diocesano', 'Encontro diocesano da juventude carismática de Sinop'),
('KOINONIA - Ministério Jovem', '2027-07-04', '2027-07-06', 7, 2027, 'nacional', 'Local: Belém (PA)'),
('Missão “Fogo, Fogo, Fogo” da RCCBRASIL (MJ / MUR / PdR)', '2027-07-07', '2027-07-11', 7, 2027, 'nacional', 'Local: Marajó (PA). Missão evangelizadora nacional'),
('ENFLM – Segunda e Terceira Etapas', '2027-07-17', '2027-07-25', 7, 2027, 'nacional', 'Local: Lorena (SP)'),
('Jesus no Pantanal', '2027-07-24', '2027-07-25', 7, 2027, 'estadual', 'Missão estadual de evangelização no Pantanal Mato-grossense'),

-- AGOSTO
('Assembleia Ordinária do Conselho Nacional', '2027-08-18', '2027-08-22', 8, 2027, 'nacional', 'Reunião do Conselho Nacional da RCCBRASIL'),
('Ministerialidade Orgânica', '2027-08-21', '2027-08-22', 8, 2027, 'diocesano', 'Formação diocesana de ministérios'),

-- SETEMBRO
('Vigília pela Nação Brasileira', '2027-09-06', '2027-09-07', 9, 2027, 'diocesano', 'Intercessão pelo Brasil na Diocese de Sinop e instâncias da RCC'),
('Assembleia do Conselho Estadual', '2027-09-11', '2027-09-12', 9, 2027, 'estadual', 'Reunião de conselho da RCC Mato Grosso'),
('Encontro Nacional de Ministros Ordenados', '2027-09-13', '2027-09-17', 9, 2027, 'nacional', 'Local: Brasília (DF)'),
('Ministerialidade Orgânica', '2027-09-18', '2027-09-19', 9, 2027, 'diocesano', 'Encontro formativo ministerial na Diocese de Sinop'),
('ECCLA-JU — Encontro Carismático Católico Latino-americano de Jovens', '2027-09-24', '2027-09-26', 9, 2027, 'nacional', 'Local: México'),
('Proposta de Peregrinação (Duquesne)', '2027-09-26', '2027-10-03', 9, 2027, 'nacional', 'Local: Duquesne (EUA). Peregrinação ao berço da RCC no mundo'),

-- OUTUBRO
('Cenáculos com Maria', '2027-10-11', '2027-10-12', 10, 2027, 'nacional', 'Instâncias da RCC (datas locais a critério de cada instância)'),
('Congresso Estadual da RCC Mato Grosso', '2027-10-16', '2027-10-17', 10, 2027, 'estadual', 'Grande Congresso Estadual da RCC MT'),
('Reunião do Conselho Diocesano', '2027-10-30', '2027-10-31', 10, 2027, 'diocesano', 'Planejamento e alinhamento pastoral da Diocese de Sinop'),

-- NOVEMBRO
('Festa do Rei Jesus 2027', '2027-11-20', '2027-11-21', 11, 2027, 'diocesano', 'Grande evento de evangelização da Diocese de Sinop');

