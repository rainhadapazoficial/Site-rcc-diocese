const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Faltam credenciais do Supabase');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const eventos2027 = [
    // --- JANEIRO 2027 ---
    {
        titulo: 'Escola N. de Formação de Líderes e Missionários (ENFLM)',
        data_inicio: '2027-01-09',
        data_fim: '2027-01-19',
        mes: 1,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: São José dos Campos (SP)'
    },
    {
        titulo: 'RENASEM — Retiro Nacional de Seminaristas',
        data_inicio: '2027-01-11',
        data_fim: '2027-01-15',
        mes: 1,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Goiânia (GO)'
    },
    {
        titulo: 'Assembleia Ordinária do Conselho Nacional',
        data_inicio: '2027-01-16',
        data_fim: '2027-01-20',
        mes: 1,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Aparecida (SP)'
    },
    {
        titulo: 'Escola Nacional de Pregação',
        data_inicio: '2027-01-16',
        data_fim: '2027-01-20',
        mes: 1,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Lorena (SP)'
    },
    {
        titulo: 'Encontro Nacional de Formação (ENF 2027)',
        data_inicio: '2027-01-20',
        data_fim: '2027-01-24',
        mes: 1,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Aparecida (SP)'
    },

    // --- FEVEREIRO 2027 ---
    {
        titulo: 'Vem Louvar — Retiro de Carnaval Diocesano',
        data_inicio: '2027-02-06',
        data_fim: '2027-02-09',
        mes: 2,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Encontros e Retiros de Carnaval em toda a Diocese de Sinop'
    },
    {
        titulo: 'Retiros de Carnaval (RCC Brasil)',
        data_inicio: '2027-02-06',
        data_fim: '2027-02-09',
        mes: 2,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Instâncias da RCC em todo o Brasil'
    },
    {
        titulo: 'Semana Jubilar – 60 anos de RCC no mundo!',
        data_inicio: '2027-02-15',
        data_fim: '2027-02-21',
        mes: 2,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Celebração comemorativa nos Grupos de Oração de todo o Brasil'
    },
    {
        titulo: 'Assembleia do Conselho Estadual',
        data_inicio: '2027-02-20',
        data_fim: '2027-02-21',
        mes: 2,
        ano: 2027,
        categoria: 'estadual',
        descricao: 'Reunião de lideranças da RCC Mato Grosso'
    },

    // --- MARÇO 2027 ---
    {
        titulo: 'Reunião do Conselho Diocesano',
        data_inicio: '2027-03-06',
        data_fim: '2027-03-07',
        mes: 3,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Reunião de coordenadores e lideranças da Diocese de Sinop'
    },
    {
        titulo: 'Domingo de Páscoa',
        data_inicio: '2027-03-28',
        data_fim: null,
        mes: 3,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Celebração da Ressurreição do Senhor'
    },

    // --- ABRIL 2027 ---
    {
        titulo: 'Oficina para Condutores de Oração',
        data_inicio: '2027-04-03',
        data_fim: '2027-04-04',
        mes: 4,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Formação diocesana para servos condutores de Grupo de Oração'
    },
    {
        titulo: 'Consagração ao Espírito Santo (Livro Jean-Philippe Roullier)',
        data_inicio: '2027-04-07',
        data_fim: '2027-05-06',
        mes: 4,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Jornada espiritual de 30 dias pelas instâncias da RCC'
    },
    {
        titulo: 'Encontro Estadual de Formação (EEF 2027)',
        data_inicio: '2027-04-24',
        data_fim: '2027-04-25',
        mes: 4,
        ano: 2027,
        categoria: 'estadual',
        descricao: 'Encontro de formação para ministérios e lideranças da RCC Mato Grosso'
    },
    {
        titulo: 'Encontro Nacional de Presidências Diocesanas',
        data_inicio: '2027-04-30',
        data_fim: '2027-05-02',
        mes: 4,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Sede Nacional da RCCBRASIL (SP)'
    },

    // --- MAIO 2027 ---
    {
        titulo: 'Projeto 1º de Maio (PdR’s)',
        data_inicio: '2027-05-01',
        data_fim: null,
        mes: 5,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Ação evangelizadora com Profissionais do Reino'
    },
    {
        titulo: 'Novena de Pentecostes',
        data_inicio: '2027-05-07',
        data_fim: '2027-05-15',
        mes: 5,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Preparação espiritual em todas as instâncias e Grupos de Oração'
    },
    {
        titulo: 'Jubileu 60 anos da RCC – em Assis',
        data_inicio: '2027-05-12',
        data_fim: '2027-05-20',
        mes: 5,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Assis - Itália. Celebração mundial do Jubileu de Diamante'
    },
    {
        titulo: 'Encontros de Pentecostes',
        data_inicio: '2027-05-15',
        data_fim: '2027-05-16',
        mes: 5,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Cenáculos e celebrações de Pentecostes na Diocese de Sinop'
    },
    {
        titulo: 'Solenidade de Pentecostes',
        data_inicio: '2027-05-16',
        data_fim: null,
        mes: 5,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Festa solene da efusão do Espírito Santo'
    },

    // --- JUNHO 2027 ---
    {
        titulo: 'Ministerialidade Orgânica',
        data_inicio: '2027-06-05',
        data_fim: '2027-06-06',
        mes: 6,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Formação diocesana de articulação ministerial'
    },
    {
        titulo: 'Simpósio Grupo de Oração – Lugar de Vivência Fraterna',
        data_inicio: '2027-06-08',
        data_fim: '2027-06-10',
        mes: 6,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Formato: Online'
    },
    {
        titulo: 'Festa da Unidade – SBCC',
        data_inicio: '2027-06-17',
        data_fim: '2027-06-20',
        mes: 6,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Cachoeira Paulista (SP)'
    },

    // --- JULHO 2027 ---
    {
        titulo: 'Congresso Diocesano Jovem',
        data_inicio: '2027-07-03',
        data_fim: '2027-07-04',
        mes: 7,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Encontro diocesano da juventude carismática de Sinop'
    },
    {
        titulo: 'KOINONIA - Ministério Jovem',
        data_inicio: '2027-07-04',
        data_fim: '2027-07-06',
        mes: 7,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Belém (PA)'
    },
    {
        titulo: 'Missão “Fogo, Fogo, Fogo” da RCCBRASIL (MJ / MUR / PdR)',
        data_inicio: '2027-07-07',
        data_fim: '2027-07-11',
        mes: 7,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Marajó (PA). Missão evangelizadora nacional'
    },
    {
        titulo: 'ENFLM – Segunda e Terceira Etapas',
        data_inicio: '2027-07-17',
        data_fim: '2027-07-25',
        mes: 7,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Lorena (SP)'
    },
    {
        titulo: 'Jesus no Pantanal',
        data_inicio: '2027-07-24',
        data_fim: '2027-07-25',
        mes: 7,
        ano: 2027,
        categoria: 'estadual',
        descricao: 'Missão estadual de evangelização no Pantanal Mato-grossense'
    },

    // --- AGOSTO 2027 ---
    {
        titulo: 'Assembleia Ordinária do Conselho Nacional',
        data_inicio: '2027-08-18',
        data_fim: '2027-08-22',
        mes: 8,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Reunião do Conselho Nacional da RCCBRASIL'
    },
    {
        titulo: 'Ministerialidade Orgânica',
        data_inicio: '2027-08-21',
        data_fim: '2027-08-22',
        mes: 8,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Formação diocesana de ministérios'
    },

    // --- SETEMBRO 2027 ---
    {
        titulo: 'Vigília pela Nação Brasileira',
        data_inicio: '2027-09-06',
        data_fim: '2027-09-07',
        mes: 9,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Intercessão pelo Brasil na Diocese de Sinop e instâncias da RCC'
    },
    {
        titulo: 'Assembleia do Conselho Estadual',
        data_inicio: '2027-09-11',
        data_fim: '2027-09-12',
        mes: 9,
        ano: 2027,
        categoria: 'estadual',
        descricao: 'Reunião de conselho da RCC Mato Grosso'
    },
    {
        titulo: 'Encontro Nacional de Ministros Ordenados',
        data_inicio: '2027-09-13',
        data_fim: '2027-09-17',
        mes: 9,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Brasília (DF)'
    },
    {
        titulo: 'Ministerialidade Orgânica',
        data_inicio: '2027-09-18',
        data_fim: '2027-09-19',
        mes: 9,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Encontro formativo ministerial na Diocese de Sinop'
    },
    {
        titulo: 'ECCLA-JU — Encontro Carismático Católico Latino-americano de Jovens',
        data_inicio: '2027-09-24',
        data_fim: '2027-09-26',
        mes: 9,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: México'
    },
    {
        titulo: 'Proposta de Peregrinação (Duquesne)',
        data_inicio: '2027-09-26',
        data_fim: '2027-10-03',
        mes: 9,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Local: Duquesne (EUA). Peregrinação ao berço da RCC no mundo'
    },

    // --- OUTUBRO 2027 ---
    {
        titulo: 'Cenáculos com Maria',
        data_inicio: '2027-10-11',
        data_fim: '2027-10-12',
        mes: 10,
        ano: 2027,
        categoria: 'nacional',
        descricao: 'Instâncias da RCC (datas locais a critério de cada instância)'
    },
    {
        titulo: 'Congresso Estadual da RCC Mato Grosso',
        data_inicio: '2027-10-16',
        data_fim: '2027-10-17',
        mes: 10,
        ano: 2027,
        categoria: 'estadual',
        descricao: 'Grande Congresso Estadual da RCC MT'
    },
    {
        titulo: 'Reunião do Conselho Diocesano',
        data_inicio: '2027-10-30',
        data_fim: '2027-10-31',
        mes: 10,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Planejamento e alinhamento pastoral da Diocese de Sinop'
    },

    // --- NOVEMBRO 2027 ---
    {
        titulo: 'Festa do Rei Jesus 2027',
        data_inicio: '2027-11-20',
        data_fim: '2027-11-21',
        mes: 11,
        ano: 2027,
        categoria: 'diocesano',
        descricao: 'Grande evento de evangelização da Diocese de Sinop'
    }
];

async function seedCalendario2027() {
    console.log(`🚀 Iniciando atualização do Calendário 2027 com ${eventos2027.length} eventos...`);

    // 1. Limpar eventos existentes de 2027 para evitar duplicatas
    const { error: deleteError } = await supabase
        .from('calendario_diocesano')
        .delete()
        .eq('ano', 2027);

    if (deleteError) {
        console.error('❌ Erro ao limpar eventos antigos de 2027:', deleteError.message);
        return;
    }

    console.log('🧹 Eventos antigos de 2027 limpos.');

    // 2. Inserir todos os novos eventos
    const { data, error: insertError } = await supabase
        .from('calendario_diocesano')
        .insert(eventos2027)
        .select('id, titulo, data_inicio, categoria');

    if (insertError) {
        console.error('❌ Erro ao inserir eventos de 2027:', insertError.message);
        return;
    }

    console.log(`✅ Sucesso! ${data.length} eventos inseridos no Calendário 2027:`);
    console.table(data);
}

seedCalendario2027();

