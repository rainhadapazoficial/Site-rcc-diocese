# AUDITORIA COMPLETA DE SEGURANÇA, API E INTEGRIDADE — RCC SINOP

**Data da Auditoria:** 05 de Novembro de 2026  
**Auditor:** Gemini 4 Argon (Engenharia Sênior de AppSec, APIs REST e Arquitetura Web)  
**Escopo:** Repositório completo `site-rcc-diocese` (Next.js 16.1.6 / React 19.2.3 / Supabase / Tailwind CSS v4 / Vercel)  
**Modo de Execução:** Diagnóstico Técnico Estático e Verificação Não-Invasiva (Zero alterações em código, banco de dados ou produção)

---

## A. Resumo Executivo

### 1. Estado Geral de Segurança do Projeto
O estado atual de segurança do projeto **RCC Diocese de Sinop** é **CRÍTICO**. Embora o site apresente uma interface pública moderna e funcional construída em Next.js App Router, a camada de controle de acesso administrativo, as políticas de banco de dados (Row-Level Security — RLS) e as rotas de servidor possuem falhas estruturais graves que permitem **execução remota de SQL arbitrário sem autenticação**, **leitura e sobrescrita de segredos de integração (`system_settings`)**, **exfiltração de dados pessoais de fiéis (`prayer_requests`)** e **adulteração direta do conteúdo público do portal**.

A principal falha arquitetural reside no fato de que **toda a autenticação administrativa foi implementada apenas no navegador (Client-Side)** por meio do componente [`AuthGuard.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/admin/AuthGuard.tsx#L9-L41) e do cliente `@supabase/supabase-js` baseado em `localStorage` ([`supabase.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/supabase.ts#L1-L11)). Não existe arquivo `middleware.ts` no projeto e os Server Components, Server Actions e Route Handlers administrativos utilizam a chave administrativa máxima (`SUPABASE_SERVICE_ROLE_KEY`) ou políticas RLS irrestritas (`USING (true)`) sem validar a sessão do usuário no servidor.

### 2. Principais Riscos Encontrados
1. **Comprometimento Total do Banco de Dados (RCE/SQLi via Server Action e RPC Público):** A Server Action [`executeSQL`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/sql/actions.ts#L12-L44) executa queries SQL arbitrárias usando `SUPABASE_SERVICE_ROLE_KEY` sem qualquer verificação de autenticação no servidor, invocando a função PostgreSQL `exec_raw_sql`, que também consta exposta no schema público PostgREST ([`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1)).
2. **Acesso Administrativo Desautenticado a Configurações, Exfiltração de Chaves e SSRF:** A rota [`/api/admin/settings`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L1-L65) permite que qualquer usuário anônimo leia (`GET`) e altere (`POST`) a tabela `system_settings` usando `SUPABASE_SERVICE_ROLE_KEY`. Isso expõe chaves como `n8n_api_key` e permite apontar `n8n_webhook_url` para um servidor externo para induzir Server-Side Request Forgery (SSRF) autenticado.
3. **Políticas RLS Irrestritas e Vazamento de Dados Pessoais (LGPD):** Scripts SQL do repositório e o schema base configuram políticas `USING (true)` sem restrição ao papel `authenticated` (`TO authenticated`), expondo publicamente pedidos de oração privados (nome, e-mail, telefone e mensagem íntima em `prayer_requests`) e permitindo escrita/exclusão anônima em tabelas de conteúdo (`events`, `posts`, `gallery`, `sync_logs`, históricos de coordenadores) e no bucket de armazenamento `media`.
4. **Bypass de Autenticação em Endpoint de Sincronização (`/api/n8n/sync-events`):** A rota [`/api/n8n/sync-events`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L10-L15) compara `Authorization` com `` `Bearer ${process.env.N8N_API_KEY}` `` sem verificar se a variável está definida, aceitando `Authorization: Bearer undefined` quando `N8N_API_KEY` está ausente do ambiente.
5. **Vazamento de Segredos e Dados via RSC Payload (Server Components sem Middleware):** As páginas [`/admin/dashboard/configuracoes`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/configuracoes/page.tsx#L5-L12) e [`/admin/dashboard/pedidos`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/pedidos/page.tsx#L6-L15) são Server Components que buscam `process.env.MCP_AUTH_TOKEN` e todos os registros de `prayer_requests` no servidor **antes** da execução do `AuthGuard` no cliente, entregando esses dados no payload HTML/RSC para requisições não autenticadas.

### 3. Quantidade de Problemas Confirmados por Gravidade

| Nível de Gravidade | Quantidade | Resumo das Categorias |
| :--- | :---: | :--- |
| **CRÍTICO** | **4** | Execução SQL sem autenticação (`executeSQL` / `exec_raw_sql`), API `/api/admin/settings` aberta + SSRF, Políticas RLS quebradas + vazamento LGPD (`prayer_requests`), Bypass `Bearer undefined` em `/api/n8n/sync-events` |
| **ALTO** | **6** | Vazamento RSC (`MCP_AUTH_TOKEN` e `prayer_requests`) por ausência de `middleware.ts`, Stored XSS via `html-react-parser`, Command Injection em GitHub Actions (`sync-history.yml`), Exposição de `n8n_api_key` no navegador, Upload arbitrário no bucket `media`, Dependências críticas vulneráveis (`next`, `proxy-addr`, `@modelcontextprotocol/sdk`, `nodemailer`, `@tiptap/core`) |
| **MÉDIO** | **8** | Injeção HTML e bug `SMTP_PASS`/`SMTP_PASSWORD` em `/api/prayer`, TLS desabilitado (`rejectUnauthorized: false`) em `/api/prayer-request`, Falha 500 permanente em `/api/mcp` (`handleRequest` inexistente), RPC `increment_page_view` inexistente em `/api/public/track`, Erro de compilação TypeScript (`TS2538` em `n8n.ts`), Hostname incorreto do Supabase em `next.config.ts`, Ausência de Security Headers/CSP/CORS/Rate Limiting, Vazamento de mensagens internas de erro (`error.message`) |
| **BAIXO** | **5** | Credenciais hardcoded em scripts e `openapi.json` na raiz, Artefatos legados do Astro em `.vercel/output` e arquivo `._page.tsx` quebrando ESLint, Funcionalidade de Pedido de Oração inacessível no site público (`/contato#pedido-oracao`), Botões e busca sem ação em Blog/Eventos e links ausentes na Sidebar Admin, Divergência de domínios Vercel hardcoded |
| **INFORMATIVO** | **2** | Problemas de pureza e efeitos em cascata no React (`navbar.tsx`, `sidebar.tsx`), Uso de `Math.random()` para nomes de arquivos e chaves de sessão |
| **TOTAL** | **25** | **25 problemas técnicos documentados e validados** |

### 4. Áreas que Exigem Atenção Prioritária
1. **Banco de Dados Supabase & RLS:** Remoção imediata da função RPC `exec_raw_sql` e revisão das políticas RLS de todas as tabelas e do bucket `media`.
2. **Autenticação Server-Side (`@supabase/ssr` + `middleware.ts`):** Migração da sessão de `localStorage` para cookies HTTP-Only verificados no servidor em todas as rotas `/admin/*`, Server Actions e Route Handlers.
3. **Rotas de API (`src/app/api/**`):** Proteção imediata de `/api/admin/settings`, correção da verificação de variáveis de ambiente em `/api/n8n/sync-events`, unificação/saneamento de `/api/prayer` e `/api/prayer-request`, e correção de `/api/mcp` e `/api/public/track`.
4. **Sanitização de HTML Público:** Adição de sanitização server-side/client-side antes de chamadas a `html-react-parser` (`parse()`).
5. **CI/CD e Dependências:** Correção de injeção de comandos em `.github/workflows/sync-history.yml`, atualização do Next.js e rotação de chaves expostas.

### 5. Limitações da Auditoria
- Respeitando estritamente as restrições estabelecidas, **nenhum teste intrusivo ou escrita/leitura destrutiva foi executado contra o banco de dados de produção no Supabase** nem contra webhooks N8N externos.
- A verificação das políticas RLS e das funções RPC em produção baseou-se na análise cruzada entre os scripts SQL do repositório (`src/lib/schema.sql` e `scripts/*.sql`), os scripts de diagnóstico existentes (`scripts/test_db_delete.js`) e o arquivo de especificação PostgREST [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json) presente na raiz do projeto.

---

## B. Classificação dos Problemas

| ID | Gravidade | Título do Problema | Confiança |
| :--- | :---: | :--- | :---: |
| **CRIT-01** | 🔴 **CRÍTICO** | Execução Remota de SQL Arbitrário sem Autenticação via Server Action `executeSQL` e RPC `exec_raw_sql` | Confirmado |
| **CRIT-02** | 🔴 **CRÍTICO** | API `/api/admin/settings` sem Autenticação Permite Leitura/Escrita de Segredos e SSRF Autenticado | Confirmado |
| **CRIT-03** | 🔴 **CRÍTICO** | Políticas RLS Irrestritas (`USING (true)`) Expõem Dados Pessoais (`prayer_requests`) e Permitem Adulteração Anônima do Banco | Confirmado |
| **CRIT-04** | 🔴 **CRÍTICO** | Bypass de Autenticação em `POST /api/n8n/sync-events` via `Authorization: Bearer undefined` | Confirmado |
| **HIGH-01** | 🟠 **ALTO** | Ausência de Autenticação Server-Side (`middleware.ts`) Vaza `MCP_AUTH_TOKEN`, `prayer_requests` e `/admin/status` via RSC Payload | Confirmado |
| **HIGH-02** | 🟠 **ALTO** | Stored XSS em Múltiplas Páginas Públicas via `html-react-parser` (`parse()`) sem Sanitização | Confirmado |
| **HIGH-03** | 🟠 **ALTO** | Injeção de Comandos Shell (Command Injection) no GitHub Actions `.github/workflows/sync-history.yml` | Confirmado |
| **HIGH-04** | 🟠 **ALTO** | Exposição da Chave `n8n_api_key` e URL de Webhook no Navegador via `shareToSocialMedia` | Confirmado |
| **HIGH-05** | 🟠 **ALTO** | Upload de Arquivos sem Validação Server-Side e Políticas Públicas de Escrita/Exclusão no Bucket `media` | Confirmado |
| **HIGH-06** | 🟠 **ALTO** | 33 Vulnerabilidades em Dependências NPM (2 Críticas e 24 Altas, incluindo Next.js, MCP SDK, Tiptap e Nodemailer) | Confirmado |
| **MED-01** | 🟡 **MÉDIO** | Duplicação de Rotas de Oração (`/api/prayer` vs `/api/prayer-request`), Injeção HTML em E-mail e Bug `SMTP_PASS` vs `SMTP_PASSWORD` | Confirmado |
| **MED-02** | 🟡 **MÉDIO** | Verificação de Certificado TLS Desabilitada (`rejectUnauthorized: false`) e Falta de Validação em `/api/prayer-request` | Confirmado |
| **MED-03** | 🟡 **MÉDIO** | Rota `POST /api/mcp` Quebrada em Tempo de Execução (`mcpServer.handleRequest` Inexistente no SDK) | Confirmado |
| **MED-04** | 🟡 **MÉDIO** | Rota `POST /api/public/track` Invoca RPC Inexistente (`increment_page_view`) e Permite Poluição de Tabela sem Rate Limit | Confirmado |
| **MED-05** | 🟡 **MÉDIO** | Erro de Compilação TypeScript (`TS2538`) em `src/lib/n8n.ts` Bloqueia Type-Checking | Confirmado |
| **MED-06** | 🟡 **MÉDIO** | Divergência de Domínio Supabase em `next.config.ts` (`xxewcdrlcwalnrdlesmd` vs `qbwbipsjbqdqjhakiaji`) | Confirmado |
| **MED-07** | 🟡 **MÉDIO** | Ausência Total de Headers de Segurança HTTP (CSP, HSTS, X-Frame-Options) e de Rate Limiting nas APIs | Confirmado |
| **MED-08** | 🟡 **MÉDIO** | Exposição de Detalhes Internos de Exceções (`error.message`) nas Respostas das Rotas de API | Confirmado |
| **LOW-01** | 🔵 **BAIXO** | Chaves Hardcoded em Scripts Locais (`scripts/check-home-js.js`) e Dump de Schema `openapi.json` no Workspace | Confirmado |
| **LOW-02** | 🔵 **BAIXO** | Artefatos Legados do Astro em `.vercel/output` e Arquivo Binário `._page.tsx` Causando 1.131 Alertas/Erros no ESLint | Confirmado |
| **LOW-03** | 🔵 **BAIXO** | Funcionalidade de Pedido de Oração Quebrada no Portal Público (Link `/contato#pedido-oracao` sem Formulário) | Confirmado |
| **LOW-04** | 🔵 **BAIXO** | Elementos de Interface Inativos (Busca/Paginação no Blog, Botões em Eventos) e Rotas Órfãs na Sidebar Admin | Confirmado |
| **LOW-05** | 🔵 **BAIXO** | Domínios de Produção Divergentes Hardcoded no Código (`site-rcc-rainhadapaz.vercel.app` vs `site-rcc-diocese.vercel.app`) | Confirmado |
| **INFO-01** | ⚪ **INFORMATIVO** | Violações das Regras do React 19 Compiler/Hooks em `navbar.tsx` e `sidebar.tsx` | Confirmado |
| **INFO-02** | ⚪ **INFORMATIVO** | Uso de `Math.random()` para Identificadores de Sessão e Nomes de Arquivos em Storage | Confirmado |

---

## C. Relatório Detalhado

### CRIT-01 — Execução Remota de SQL Arbitrário sem Autenticação via Server Action `executeSQL` e RPC `exec_raw_sql`

| Campo | Informação |
|---|---|
| **ID** | `CRIT-01` |
| **Gravidade** | **CRÍTICO** |
| **Localização** | [`src/app/(admin)/admin/dashboard/sql/actions.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/sql/actions.ts#L1-L44) (função `executeSQL`, linhas 12–44), [`src/app/(admin)/admin/dashboard/sql/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/sql/page.tsx#L1-L214) e [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) (`/rpc/exec_raw_sql`) |
| **Problema** | A Server Action `executeSQL(query: string)` é marcada com `"use server"`, instancia um cliente Supabase com `SUPABASE_SERVICE_ROLE_KEY` (linhas 6–9) e executa `supabase.rpc("exec_raw_sql", { sql_query: query })` (linha 19) **sem nenhuma verificação de autenticação ou autorização no servidor**. Além disso, a função RPC `exec_raw_sql` está publicada no schema público do PostgREST do projeto Supabase. |
| **Evidência** | No Next.js App Router, funções exportadas de arquivos `"use server"` tornam-se endpoints HTTP `POST` públicos (identificados pelo cabeçalho `Next-Action`). Como o controle de acesso do painel (`AuthGuard.tsx`) roda exclusivamente no cliente (`"use client"`), qualquer requisição HTTP `POST` direta para a Server Action invoca `executeSQL` com privilégios de `service_role`. Adicionalmente, em [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) observa-se a definição pública de `/rpc/exec_raw_sql` aceitando o parâmetro `sql_query: string`. |
| **Impacto** | Comprometimento total e irrestrito do banco de dados: leitura, modificação ou exclusão (`DROP TABLE`, `TRUNCATE`, `ALTER POLICY`) de todas as tabelas, leitura de esquemas internos, exfiltração de dados pessoais e tomada de controle de contas no Supabase. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Remover o módulo de terminal SQL da aplicação web (`src/app/(admin)/admin/dashboard/sql/actions.ts` e `page.tsx`), pois o próprio painel do Supabase já oferece SQL Editor autenticado com MFA.<br>2. Executar no Supabase: `DROP FUNCTION IF EXISTS public.exec_raw_sql(text);` (ou revogar execução de `anon`, `authenticated` e `service_role`: `REVOKE ALL ON FUNCTION public.exec_raw_sql FROM PUBLIC, anon, authenticated;`). |
| **Validação** | Verificar que `src/app/(admin)/admin/dashboard/sql/` não existe mais no build e confirmar via consulta ao catálogo `pg_proc` / `openapi.json` do Supabase que `/rpc/exec_raw_sql` retorna `404 Not Found`. |

---

### CRIT-02 — API `/api/admin/settings` sem Autenticação Permite Leitura/Escrita de Segredos e SSRF Autenticado

| Campo | Informação |
|---|---|
| **ID** | `CRIT-02` |
| **Gravidade** | **CRÍTICO** |
| **Localização** | [`src/app/api/admin/settings/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L1-L65) (`GET` linhas 12–34, `POST` linhas 36–64) e [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L31-L62) (`triggerN8NWebhook`, linhas 31–62) |
| **Problema** | O Route Handler `/api/admin/settings` utiliza `SUPABASE_SERVICE_ROLE_KEY` (linhas 4–10) para retornar todas as linhas de `system_settings` no método `GET` e para sobrescrever (`upsert`) qualquer par `settings_key` / `settings_value` no método `POST`, **sem validar nenhum token, cookie ou sessão de administrador**. |
| **Evidência** | Nas linhas 12–64 de [`src/app/api/admin/settings/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L12-L64), não há leitura de headers `Authorization` nem de sessão Supabase. Em [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L32-L54), `triggerN8NWebhook` lê `n8n_webhook_url` e `n8n_api_key` da tabela `system_settings` e realiza um `fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Authorization': 'Bearer ' + API_KEY } })` sempre que um pedido de oração é enviado em `/api/prayer` ou `/api/prayer-request`. |
| **Impacto** | 1. **Exfiltração de Segredos:** Qualquer visitante pode fazer `GET /api/admin/settings` e obter `n8n_api_key` e `n8n_webhook_url` em texto claro.<br>2. **SSRF e Roubo de Variável de Ambiente:** Um atacante pode enviar `POST /api/admin/settings` alterando `n8n_webhook_url` para um domínio sob seu controle e disparar `POST /api/prayer`, fazendo o servidor Next.js na Vercel realizar requisições HTTP arbitrárias (SSRF) e vazar `process.env.N8N_API_KEY` no cabeçalho `Authorization`. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Implementar validação obrigatória de sessão administrativa no servidor (via `@supabase/ssr` `supabase.auth.getUser()`) no início de `GET` e `POST` em `/api/admin/settings`, retornando `401 Unauthorized` se não autenticado.<br>2. Nunca retornar segredos completos (`n8n_api_key`) no `GET` (retornar apenas máscara booleana `has_api_key: true`).<br>3. Validar `n8n_webhook_url` contra uma lista de domínios permitidos (allowlist HTTPS) antes de salvar e antes de executar `fetch` em `src/lib/n8n.ts`. |
| **Validação** | Realizar requisição `GET /api/admin/settings` e `POST /api/admin/settings` sem cookie de sessão válido e confirmar retorno `401 Unauthorized`. |

---

### CRIT-03 — Políticas RLS Irrestritas (`USING (true)`) Expõem Dados Pessoais (`prayer_requests`) e Permitem Adulteração Anônima do Banco

| Campo | Informação |
|---|---|
| **ID** | `CRIT-03` |
| **Gravidade** | **CRÍTICO** |
| **Localização** | [`src/lib/schema.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/schema.sql#L94) (linha 94), [`scripts/fix_rls_unrestricted.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/fix_rls_unrestricted.sql#L22-L32), [`scripts/fix_rls_nuclear_events.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/fix_rls_nuclear_events.sql#L22-L51), [`scripts/fix_rls_admin_final.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/fix_rls_admin_final.sql#L14-L27), [`scripts/create_group_coordinator_history.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/create_group_coordinator_history.sql#L30), [`scripts/create_ministerio_coordinator_history.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/create_ministerio_coordinator_history.sql#L30) e [`scripts/test_db_delete.js`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/test_db_delete.js#L1-L52) |
| **Problema** | Diversas políticas de Row-Level Security (RLS) foram criadas com o nome `"Allow authenticated..."` ou `"nuclear_..."`, porém omitiram a cláusula `TO authenticated` (ou `auth.role() = 'authenticated'`), utilizando apenas `USING (true)` e `WITH CHECK (true)`. No PostgreSQL/Supabase, omitir `TO <role>` aplica a política a `PUBLIC` (incluindo o papel anônimo `anon`). |
| **Evidência** | 1. Em [`src/lib/schema.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/schema.sql#L94): `CREATE POLICY "Allow authenticated read" ON prayer_requests FOR SELECT USING (true);` — expõe todos os pedidos de oração (`name`, `email`, `phone`, `message`) para qualquer cliente usando `NEXT_PUBLIC_SUPABASE_ANON_KEY`.<br>2. Em [`scripts/fix_rls_unrestricted.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/fix_rls_unrestricted.sql#L22-L32) e [`scripts/fix_rls_nuclear_events.sql`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/fix_rls_nuclear_events.sql#L22-L26): `CREATE POLICY "nuclear_events_all" ON public.events FOR ALL USING (true) WITH CHECK (true);` (sem `TO authenticated`), replicado também para `posts`, `gallery`, `sync_logs`, `group_coordinator_history` e `ministerio_coordinator_history`.<br>3. O script [`scripts/test_db_delete.js`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/test_db_delete.js#L7-L44) comprova empiricamente que a chave pública `NEXT_PUBLIC_SUPABASE_ANON_KEY` consegue inserir e deletar registros diretamente na tabela `events` sem login. |
| **Impacto** | 1. **Violação Grave de Privacidade (LGPD):** Qualquer pessoa com a `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública no bundle JS do navegador) pode baixar todos os pedidos de oração com nomes, telefones, e-mails e relatos pessoais.<br>2. **Defacement / Adulteração Total:** Qualquer usuário não autenticado pode inserir, editar ou apagar notícias (`posts`), eventos (`events`), fotos (`gallery`) e históricos de coordenadores diretamente via API REST do Supabase. |
| **Confiança** | **Confirmado** |
| **Correção** | Criar e aplicar uma migração SQL consolidada de endurecimento (hardening) de RLS no Supabase:<br>1. Para `prayer_requests` e `contact_submissions`: permitir `INSERT` para `anon, authenticated`, mas restringir `SELECT, UPDATE, DELETE` exclusivamente `TO authenticated USING (auth.role() = 'authenticated')`.<br>2. Para todas as tabelas de conteúdo público (`posts`, `events`, `groups`, `ministerios`, `foranias`, `custom_pages`, `site_settings`, `calendario_diocesano`, `conselho_mandatos`, `conselho_membros`, `festa_rei_jesus_edicoes`, `group_coordinator_history`, `ministerio_coordinator_history`, `gallery`): manter `FOR SELECT TO anon, authenticated USING (true)` e restringir `FOR INSERT, UPDATE, DELETE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')`.<br>3. Para `system_settings` e `sync_logs`: revogar todo acesso de `anon` (`REVOKE ALL ON public.system_settings FROM anon;`). |
| **Validação** | Executar um teste local com `NEXT_PUBLIC_SUPABASE_ANON_KEY` tentando `SELECT` em `prayer_requests` (deve retornar 0 linhas ou erro de permissão) e `INSERT/DELETE` em `events`/`posts` (deve retornar erro RLS `42501`). |

---

### CRIT-04 — Bypass de Autenticação em `POST /api/n8n/sync-events` via `Authorization: Bearer undefined`

| Campo | Informação |
|---|---|
| **ID** | `CRIT-04` |
| **Gravidade** | **CRÍTICO** |
| **Localização** | [`src/app/api/n8n/sync-events/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L10-L15) (linhas 10–15) |
| **Problema** | A rota `POST /api/n8n/sync-events` valida a autenticação com `if (authHeader !== \`Bearer ${process.env.N8N_API_KEY}\`)`, mas **não verifica se `process.env.N8N_API_KEY` está definido** antes da comparação. |
| **Evidência** | Diferentemente de [`src/app/api/mcp/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/mcp/route.ts#L9) e [`src/app/api/import/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/import/route.ts#L22), que verificam `if (!authToken || authHeader !== ...)`, o arquivo [`src/app/api/n8n/sync-events/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L13) interpola diretamente `process.env.N8N_API_KEY`. No arquivo `.env` do projeto, `N8N_API_KEY` não está configurado (`undefined`). Consequentemente, a expressão avalia para `"Bearer undefined"`, permitindo que qualquer requisição com o cabeçalho `Authorization: Bearer undefined` passe pela autenticação e insira eventos arbitrários no banco usando `SUPABASE_SERVICE_ROLE_KEY` (linha 5). |
| **Impacto** | Qualquer agente externo não autenticado pode injetar eventos falsos ou payloads de Stored XSS (visto que `event.description` é renderizado sem sanitização em `/eventos/[id]`, ver `HIGH-02`) diretamente no banco de dados. |
| **Confiança** | **Confirmado** |
| **Correção** | Validar explicitamente a presença da variável de ambiente e utilizar comparação segura em tempo constante (`crypto.timingSafeEqual`):<br>`const apiKey = process.env.N8N_API_KEY;`<br>`if (!apiKey || authHeader !== \`Bearer ${apiKey}\`) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }` |
| **Validação** | Enviar requisição `POST /api/n8n/sync-events` com header `Authorization: Bearer undefined` e confirmar retorno `401 Unauthorized`. |

---

### HIGH-01 — Ausência de Autenticação Server-Side (`middleware.ts`) Vaza `MCP_AUTH_TOKEN`, `prayer_requests` e `/admin/status` via RSC Payload

| Campo | Informação |
|---|---|
| **ID** | `HIGH-01` |
| **Gravidade** | **ALTO** |
| **Localização** | [`src/components/admin/AuthGuard.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/admin/AuthGuard.tsx#L9-L41), [`src/app/(admin)/admin/dashboard/layout.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/layout.tsx#L1-L26), [`src/app/(admin)/admin/dashboard/configuracoes/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/configuracoes/page.tsx#L5-L12), [`src/app/(admin)/admin/dashboard/pedidos/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/pedidos/page.tsx#L6-L15) e [`src/app/(admin)/admin/status/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/status/page.tsx#L1-L156) |
| **Problema** | O projeto não possui `src/middleware.ts` e utiliza `@supabase/supabase-js` (que armazena a sessão no `localStorage` do navegador) em vez de `@supabase/ssr` (cookies). O componente `AuthGuard` é um Client Component (`"use client"`) que só verifica a sessão dentro de um `useEffect` no navegador. Porém, os Server Components filhos dentro de `/admin/dashboard/*` são executados no servidor **antes** do `AuthGuard` rodar no cliente, enviando seus dados serializados no HTML/RSC payload para qualquer requisição HTTP. Além disso, a rota `/admin/status` está fora de `/admin/dashboard/layout.tsx` e não possui sequer o `AuthGuard` client-side. |
| **Evidência** | 1. [`src/app/(admin)/admin/dashboard/configuracoes/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/configuracoes/page.tsx#L6) lê `const mcpToken = process.env.MCP_AUTH_TOKEN || "Não configurado";` no servidor e o repassa como prop para `<ConfigClient mcpToken={mcpToken} />`. Qualquer `curl` sem autenticação para `/admin/dashboard/configuracoes` recebe o valor de `MCP_AUTH_TOKEN` no payload RSC (e com `MCP_AUTH_TOKEN`, um atacante pode chamar `POST /api/import` para injetar notícias/eventos com `SUPABASE_SERVICE_ROLE_KEY`).<br>2. [`src/app/(admin)/admin/dashboard/pedidos/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/pedidos/page.tsx#L7-L11) busca todos os registros de `prayer_requests` no servidor e os renderiza no HTML/RSC payload antes do redirecionamento client-side.<br>3. [`src/app/(admin)/admin/status/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/status/page.tsx#L15-L156) é totalmente pública sem login. |
| **Impacto** | Exfiltração direta do segredo `MCP_AUTH_TOKEN` (permitindo comprometer `/api/import` e `/api/mcp`), exposição de todos os pedidos de oração via `curl /admin/dashboard/pedidos`, e acesso público a diagnósticos internos e logs em `/admin/status`. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Instalar `@supabase/ssr` e implementar `src/middleware.ts` interceptando todas as rotas `/admin/dashboard/:path*`, `/admin/status` e `/api/admin/:path*`, redirecionando para `/admin/login` no servidor caso não haja sessão válida.<br>2. Nunca passar segredos de servidor (`process.env.MCP_AUTH_TOKEN`) como props para Client Components. |
| **Validação** | Executar `curl -i http://localhost:3000/admin/dashboard/configuracoes` e `curl -i http://localhost:3000/admin/dashboard/pedidos` sem cookies e verificar retorno `307 Temporary Redirect` para `/admin/login` com corpo vazio (zero vazamento no RSC payload). |

---

### HIGH-02 — Stored XSS em Múltiplas Páginas Públicas via `html-react-parser` (`parse()`) sem Sanitização

| Campo | Informação |
|---|---|
| **ID** | `HIGH-02` |
| **Gravidade** | **ALTO** |
| **Localização** | [`src/app/(public)/blog/[slug]/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/blog/%5Bslug%5D/page.tsx#L117) (linha 117), [`src/app/(public)/eventos/[id]/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/eventos/%5Bid%5D/page.tsx#L89) (linha 89), [`src/app/(public)/p/[slug]/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/p/%5Bslug%5D/page.tsx#L59) (linha 59) e [`src/app/(public)/festa-rei-jesus/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/festa-rei-jesus/page.tsx#L114) (linha 114) |
| **Problema** | O conteúdo HTML vindo do banco de dados (`post.content`, `event.description`, `page.content` e `pageContent.content`) é convertido em elementos React diretamente pela função `parse()` da biblioteca `html-react-parser` sem qualquer sanitização prévia (como `isomorphic-dompurify` ou `sanitize-html`). |
| **Evidência** | `html-react-parser` converte fielmente tags `<script>`, `<iframe src="javascript:...">`, `<img src=x onerror="...">` e atributos de evento em nós DOM executáveis. Combinado com `CRIT-03` (RLS aberta em `posts` e `events`) ou `CRIT-04` (`/api/n8n/sync-events` sem autenticação), qualquer atacante externo pode injetar JavaScript persistente nas páginas públicas do portal. Além disso, os scripts [`scripts/sync-rcc.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/sync-rcc.ts#L50-L79) e [`scripts/sync-rcc-history.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/sync-rcc-history.ts#L35-L70) ingerem HTML de fontes externas via scraping/RSS. |
| **Impacto** | Execução de JavaScript arbitrário (Stored XSS) no navegador de todos os visitantes e administradores que visualizarem a notícia, evento ou página afetada — permitindo roubo do token JWT do administrador armazenado em `localStorage`. |
| **Confiança** | **Confirmado** |
| **Correção** | Criar um utilitário centralizado de sanitização (ex: `sanitizeHtml(html)` usando `sanitize-html` ou `isomorphic-dompurify` com allowlist estrita de tags e atributos seguros) e aplicá-lo antes de todas as chamadas a `parse()` nas 4 páginas públicas e no salvamento do banco. |
| **Validação** | Inserir um registro de teste em ambiente local contendo `<img src=x onerror=alert(1)>` e verificar que o atributo `onerror` é removido do HTML renderizado. |

---

### HIGH-03 — Injeção de Comandos Shell (Command Injection) no GitHub Actions `.github/workflows/sync-history.yml`

| Campo | Informação |
|---|---|
| **ID** | `HIGH-03` |
| **Gravidade** | **ALTO** |
| **Localização** | [`.github/workflows/sync-history.yml`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/.github/workflows/sync-history.yml#L34-L42) (linhas 34–42) |
| **Problema** | O workflow `sync-history.yml` interpola diretamente os inputs do evento `workflow_dispatch` (`${{ github.event.inputs.all }}` e `${{ github.event.inputs.pages }}`) dentro do bloco `run:` do shell Bash, no mesmo passo em que `SUPABASE_SERVICE_ROLE_KEY` está exposto como variável de ambiente. |
| **Evidência** | Nas linhas 37–40 de [`.github/workflows/sync-history.yml`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/.github/workflows/sync-history.yml#L37-L40):<br>`if [ "${{ github.event.inputs.all }}" == "true" ]; then npx tsx scripts/sync-rcc-history.ts --all; else npx tsx scripts/sync-rcc-history.ts --pages ${{ github.event.inputs.pages }}; fi`<br>Como `${{ ... }}` é expandido pelo pré-processador do GitHub Actions antes do shell executar o script, qualquer colaborador com permissão de disparar o workflow pode injetar metacaracteres shell no campo `pages` e exfiltrar `secrets.SUPABASE_SERVICE_ROLE_KEY`. |
| **Impacto** | Execução remota de comandos no runner do GitHub Actions e vazamento de `SUPABASE_SERVICE_ROLE_KEY`. |
| **Confiança** | **Confirmado** |
| **Correção** | Passar `github.event.inputs.all` e `github.event.inputs.pages` como variáveis de ambiente (`INPUT_ALL`, `INPUT_PAGES`) no bloco `env:` e validar no Bash que `INPUT_PAGES` contém apenas dígitos (`[[ "$INPUT_PAGES" =~ ^[0-9]+$ ]]`) antes de executar o comando. |
| **Validação** | Inspecionar o arquivo YAML com `actionlint` e verificar que nenhuma expressão `${{ github.event.inputs.* }}` aparece diretamente dentro de blocos `run:`. |

---

### HIGH-04 — Exposição da Chave `n8n_api_key` e URL de Webhook no Navegador via `shareToSocialMedia`

| Campo | Informação |
|---|---|
| **ID** | `HIGH-04` |
| **Gravidade** | **ALTO** |
| **Localização** | [`src/app/(admin)/admin/dashboard/noticias/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/noticias/page.tsx#L19) (linhas 19 e 115–121) e [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L64-L81) (`shareToSocialMedia`, linhas 64–81) |
| **Problema** | A página Client Component [`noticias/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/noticias/page.tsx#L1) importa e executa `shareToSocialMedia` diretamente no navegador do usuário ao publicar uma notícia com a opção de compartilhamento marcada. `shareToSocialMedia` chama `triggerN8NWebhook`, que busca `n8n_api_key` e `n8n_webhook_url` no banco e dispara um `fetch` cross-origin a partir do navegador com o cabeçalho `Authorization: Bearer <n8n_api_key>`. |
| **Evidência** | Em [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L6-L35), `getN8NSettings()` usa o cliente `supabase` (browser/anon) para ler `system_settings` e envia o token secreto `n8n_api_key` em uma requisição originada no cliente. Além de expor o segredo na aba Network do navegador e exigir que `system_settings` seja legível pelo cliente, a chamada tende a falhar por bloqueio de CORS no servidor N8N. |
| **Impacto** | Exposição da chave de autenticação `n8n_api_key` no cliente e falha de integração por política de CORS. |
| **Confiança** | **Confirmado** |
| **Correção** | Mover `triggerN8NWebhook` e `shareToSocialMedia` para um Route Handler exclusivo de servidor (ou Server Action autenticada), mantendo `system_settings` inacessível para o cliente browser. |
| **Validação** | Verificar que `src/lib/n8n.ts` possui `import "server-only"` e que nenhuma chamada a webhooks N8N parte diretamente do bundle client-side. |

---

### HIGH-05 — Upload de Arquivos sem Validação Server-Side e Políticas Públicas de Escrita/Exclusão no Bucket `media`

| Campo | Informação |
|---|---|
| **ID** | `HIGH-05` |
| **Gravidade** | **ALTO** |
| **Localização** | [`scripts/setup_storage.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/setup_storage.ts#L1-L43), [`src/components/admin/PremiumEditor.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/admin/PremiumEditor.tsx#L73-L108), [`src/app/(admin)/admin/dashboard/grupos/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/grupos/page.tsx#L61-L74), [`src/app/(admin)/admin/dashboard/ministerios/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/ministerios/page.tsx#L75-L121), [`src/app/(admin)/admin/dashboard/conselho/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/conselho/page.tsx#L118-L133) e [`src/app/(admin)/admin/dashboard/festa-rei-jesus/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/festa-rei-jesus/page.tsx#L87-L102) |
| **Problema** | Os uploads de arquivos para o bucket `media` do Supabase Storage são feitos diretamente do cliente sem validação de extensão real (magic bytes), tipo MIME seguro ou tamanho máximo em páginas como `grupos`, `ministerios`, `conselho` e `festa-rei-jesus` (apenas `PremiumEditor` e `BannerClient` checam `file.size > 5MB` no cliente). A extensão do arquivo é extraída com `file.name.split('.').pop()`, permitindo upload de `.svg`, `.html` ou `.js` caso o input `accept="image/*"` seja contornado. |
| **Evidência** | Em [`src/app/(admin)/admin/dashboard/grupos/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/grupos/page.tsx#L61-L68): `const fileExt = file.name.split(".").pop(); ... supabase.storage.from("media").upload(filePath, file);`. Além disso, [`scripts/setup_storage.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/setup_storage.ts#L16-L19) cria o bucket `media` com `public: true` sem configurar `allowedMimeTypes` nem `fileSizeLimit`. |
| **Impacto** | Hospedagem de arquivos maliciosos (ex: SVG/HTML com JavaScript para phishing/XSS no domínio do Supabase Storage) e exaustão de cota de armazenamento. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Configurar no bucket `media` do Supabase: `file_size_limit = 5242880` (5 MB) e `allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']` (bloqueando `image/svg+xml` e `text/html`).<br>2. Garantir que políticas RLS em `storage.objects` para `INSERT`, `UPDATE` e `DELETE` exijam `TO authenticated USING (bucket_id = 'media' AND auth.role() = 'authenticated')`.<br>3. Validar a extensão contra uma allowlist (`['jpg', 'jpeg', 'png', 'webp', 'gif']`) no código antes do upload. |
| **Validação** | Tentar fazer upload de um arquivo `.html` ou `.svg` ou maior que 5 MB no bucket `media` e confirmar rejeição pelo servidor do Supabase Storage. |

---

### HIGH-06 — 33 Vulnerabilidades em Dependências NPM (2 Críticas e 24 Altas, incluindo Next.js, MCP SDK, Tiptap e Nodemailer)

| Campo | Informação |
|---|---|
| **ID** | `HIGH-06` |
| **Gravidade** | **ALTO** |
| **Localização** | [`package.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/package.json#L1-L72) e `package-lock.json` |
| **Problema** | A execução de `npm audit` identificou **33 pacotes vulneráveis** na árvore de dependências (2 Críticas, 24 Altas, 6 Moderadas e 1 Baixa). |
| **Evidência** | Saída verificada do comando `npm audit`:<br>- **`next` (`16.1.6`, Crítica):** Múltiplos CVEs/GHSAs incluindo *HTTP request smuggling in rewrites* (`GHSA-ggv3-7p47-pfv8`), *null origin bypass in Server Actions CSRF checks* (`GHSA-mq59-m269-xvcx`), *Unauthenticated RCE in Image Optimization API* (`GHSA-2xp9-vwfh-vxw4`, `GHSA-2464-fhr4-w9xw`), *Middleware bypass* (`GHSA-492v-c6pp-mqqv`, `GHSA-26hh-7cqf-hhc6`) e *DoS in Server Components/Actions*.<br>- **`proxy-addr` (`1.1.0 - 2.0.7`, Crítica):** IP spoofing via sub-rede IPv4-mapped IPv6 (`GHSA-jqcg-44mw-7w3h`).<br>- **`@modelcontextprotocol/sdk` (`<=1.31.0`, Alta):** Vazamento de dados entre clientes e DoS de memória (`GHSA-345p-7cg4-v4c7`, `GHSA-46jr-4wx8-v453`).<br>- **`@tiptap/core` (`<=3.30.4`, Alta) & `prosemirror-view` (`<1.42.3`, Alta):** XSS no paste handler (`GHSA-c8x8-7fp4-3x9w`) e prototype pollution em `mergeAttributes()` (`GHSA-cp6q-959q-f8rh`).<br>- **`nodemailer` (`<=10.1.3`, Alta):** SMTP command injection, CRLF injection e ReDoS (`GHSA-c7w3-x93f-qmm8`, `GHSA-268h-hp4c-crq3`).<br>- **`sharp`, `postcss`, `zod`, `lodash`, `ws`, `path-to-regexp` (Altas):** CVEs de DoS e memória. |
| **Impacto** | Exposição da aplicação em produção a vetores conhecidos e públicos de RCE em otimização de imagens, bypass de CSRF em Server Actions, XSS no editor administrativo Tiptap e DoS. |
| **Confiança** | **Confirmado** |
| **Correção** | Atualizar `next` para `^16.4.5` (ou versão patcheada mais recente), `@modelcontextprotocol/sdk`, `@tiptap/*`, `nodemailer` e executar `npm audit fix` seguido de testes de build (`npm run build`). |
| **Validação** | Executar `npm audit` após a atualização e confirmar `0 vulnerabilities` (ou ausência de vulnerabilidades críticas/altas em dependências de produção). |

---

### MED-01 — Duplicação de Rotas de Oração (`/api/prayer` vs `/api/prayer-request`), Injeção HTML em E-mail e Bug `SMTP_PASS` vs `SMTP_PASSWORD`

| Campo | Informação |
|---|---|
| **ID** | `MED-01` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/app/api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L1-L103) (linhas 51–98) e [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L1-L108) |
| **Problema** | Existem duas rotas concorrentes para a mesma finalidade (`/api/prayer` e `/api/prayer-request`) com implementações divergentes:<br>1. Em [`/api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L65-L84), os campos `name`, `email`, `phone` e `message` são interpolados **sem escape HTML** no corpo do e-mail enviado para a equipe da RCC (enquanto `/api/prayer-request` usa `escapeHtml`).<br>2. Em [`/api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L57), o transporte Nodemailer lê `pass: process.env.SMTP_PASSWORD`, mas na linha 88 verifica `if (process.env.SMTP_USER && process.env.SMTP_PASS)` — nomes de variáveis diferentes, impedindo o envio de e-mail se apenas uma estiver definida.<br>3. Na linha 96, `/api/prayer` retorna `data` (o registro completo recém-inserido) na resposta JSON. |
| **Evidência** | Comparação direta entre [`src/app/api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L51-L98) e [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L4-L99). |
| **Impacto** | Injeção de HTML malicioso (phishing) nos e-mails administrativos recebidos pela pastoral e falha silenciosa no envio de notificações por e-mail. |
| **Confiança** | **Confirmado** |
| **Correção** | Unificar em uma única rota (ex: manter `/api/prayer` e remover ou redirecionar `/api/prayer-request`), aplicar `escapeHtml()` em todos os campos interpolados no template de e-mail, padronizar a variável `SMTP_PASS` (com fallback para `SMTP_PASSWORD`) e não retornar o objeto `data` do banco na resposta pública. |
| **Validação** | Verificar que o envio de caracteres `<B>teste</B>` resulta em `&lt;B&gt;teste&lt;/B&gt;` no HTML do e-mail gerado. |

---

### MED-02 — Verificação de Certificado TLS Desabilitada (`rejectUnauthorized: false`) e Falta de Validação em `/api/prayer-request`

| Campo | Informação |
|---|---|
| **ID** | `MED-02` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L16-L33) (linhas 16–33) |
| **Problema** | A rota `/api/prayer-request`:<br>1. Desabilita a validação de certificado TLS na conexão SMTP (`tls: { rejectUnauthorized: false }` na linha 31), tornando a transmissão de credenciais SMTP e dados dos fiéis vulnerável a interceptação Man-in-the-Middle (MitM).<br>2. Não valida se `name` e `message` foram preenchidos antes de inserir no banco e disparar o e-mail. |
| **Evidência** | Linha 31 de [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L31): `tls: { rejectUnauthorized: false }`. |
| **Impacto** | Possibilidade de interceptação de credenciais SMTP em trânsito e inserção de registros vazios/inválidos em `prayer_requests`. |
| **Confiança** | **Confirmado** |
| **Correção** | Remover `tls: { rejectUnauthorized: false }` (ou consolidar a rota com `/api/prayer`, que não desativa a verificação TLS) e validar tamanho e obrigatoriedade de `name`, `email`, `phone` e `message` com `zod`. |
| **Validação** |Enviar payload vazio `{}` e confirmar retorno `400 Bad Request`. |

---

### MED-03 — Rota `POST /api/mcp` Quebrada em Tempo de Execução (`mcpServer.handleRequest` Inexistente no SDK)

| Campo | Informação |
|---|---|
| **ID** | `MED-03` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/app/api/mcp/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/mcp/route.ts#L22-L26) (linhas 22–26) e [`src/lib/mcpService.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/mcpService.ts#L7-L16) |
| **Problema** | A rota `POST /api/mcp` faz um type cast forçado `(mcpServer as unknown as { handleRequest: (req: unknown) => unknown }).handleRequest(body)` (linha 24). Contudo, a classe `Server` de `@modelcontextprotocol/sdk/server/index.js` **não possui o método `handleRequest`**, exigindo um transporte (como `StreamableHTTPServerTransport` ou `SSEServerTransport`). |
| **Evidência** | O próprio código precisou usar `as unknown as { handleRequest: ... }` para silenciar o erro do TypeScript porque `Server` não declara `handleRequest`. Qualquer chamada autenticada a `POST /api/mcp` lança `TypeError: mcpServer.handleRequest is not a function` e retorna `500 Internal Server Error`. |
| **Impacto** | A integração via endpoint `/api/mcp` está 100% inoperante em produção (apenas `/api/import` funciona para automações REST). |
| **Confiança** | **Confirmado** |
| **Correção** | Conectar `mcpServer` ao transporte HTTP oficial do `@modelcontextprotocol/sdk` (`StreamableHTTPServerTransport`) ou processar o método JSON-RPC (`tools/list`, `tools/call`) adequadamente. |
| **Validação** | Enviar requisição `POST /api/mcp` autenticada com payload JSON-RPC `{"jsonrpc":"2.0","id":1,"method":"tools/list"}` e confirmar retorno `200 OK` com a lista de ferramentas. |

---

### MED-04 — Rota `POST /api/public/track` Invoca RPC Inexistente (`increment_page_view`) e Permite Poluição de Tabela sem Rate Limit

| Campo | Informação |
|---|---|
| **ID** | `MED-04` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/app/api/public/track/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/public/track/route.ts#L1-L44) (linhas 11–37) e [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) |
| **Problema** | 1. A rota chama `supabase.rpc('increment_page_view', { page_slug: slug })` (linha 19), mas a função RPC `increment_page_view` **não existe** no banco de dados (nem nos arquivos `.sql` do repositório, nem no `openapi.json` do Supabase).<br>2. Quando o RPC falha, o código executa um fallback que faz `SELECT` + `UPDATE` ou `INSERT` usando `SUPABASE_SERVICE_ROLE_KEY` (2 round-trips ao banco a cada página carregada por cada visitante e sujeito a condição de corrida).<br>3. Não há validação do valor de `slug`, permitindo que um atacante envie milhões de slugs aleatórios (`{"slug": "random-12345"}`) para criar linhas infinitas na tabela `page_views`. |
| **Evidência** | Inspeção de [`src/app/api/public/track/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/public/track/route.ts#L19-L36) e verificação das rotas `/rpc/*` em [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) (onde existem apenas `rls_auto_enable` e `exec_raw_sql`). |
| **Impacto** | Lentidão desnecessária (2 queries por pageview), perda de contagem em acessos simultâneos (race condition) e risco de exaustão de armazenamento no banco via criação ilimitada de slugs falsos. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Criar a função atômica `increment_page_view` no PostgreSQL usando `INSERT INTO public.page_views (slug, views) VALUES (page_slug, 1) ON CONFLICT (slug) DO UPDATE SET views = page_views.views + 1;`.<br>2. Validar `slug` com regex (`/^\/[a-zA-Z0-9\-\/]*$/`, máx. 120 caracteres) antes de gravar no banco. |
| **Validação** | Enviar `{"slug": "invalid slug!@#"}` para `POST /api/public/track` e verificar rejeição `400 Bad Request`. |

---

### MED-05 — Erro de Compilação TypeScript (`TS2538`) em `src/lib/n8n.ts` Bloqueia Type-Checking

| Campo | Informação |
|---|---|
| **ID** | `MED-05` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L17-L20) (linha 18) |
| **Problema** | A execução de `npx tsc --noEmit` falha com erro de compilação na linha 18 de `src/lib/n8n.ts`: `error TS2538: Type 'unknown' cannot be used as an index type` em `acc[curr.settings_key] = String(curr.settings_value);`. |
| **Evidência** | Na linha 17 de [`src/lib/n8n.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/lib/n8n.ts#L17): `curr: Record<string, unknown>` define os valores das propriedades de `curr` como `unknown`, portanto `curr.settings_key` tem tipo `unknown` e não pode indexar `acc: Record<string, string>`. |
| **Impacto** | Quebra da verificação estática de tipos (`tsc --noEmit`) e potencial falha de build em ambientes com verificação estrita de TypeScript. |
| **Confiança** | **Confirmado** |
| **Correção** | Tipar corretamente o retorno como `{ settings_key: string; settings_value: string | null }` ou converter `acc[String(curr.settings_key)] = String(curr.settings_value ?? '');`. |
| **Validação** | Executar `npx tsc --noEmit` e confirmar saída com código `0` (sem erros). |

---

### MED-06 — Divergência de Domínio Supabase em `next.config.ts` (`xxewcdrlcwalnrdlesmd` vs `qbwbipsjbqdqjhakiaji`)

| Campo | Informação |
|---|---|
| **ID** | `MED-06` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`next.config.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/next.config.ts#L4-L14) (linha 8) |
| **Problema** | A configuração `images.remotePatterns` em `next.config.ts` autoriza apenas o hostname `xxewcdrlcwalnrdlesmd.supabase.co` (projeto antigo), enquanto o projeto atual utiliza `qbwbipsjbqdqjhakiaji.supabase.co`. |
| **Evidência** | Linha 8 de [`next.config.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/next.config.ts#L8) vs URL configurada em `.env` e [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L4). |
| **Impacto** | Qualquer componente `<Image />` do `next/image` que tente otimizar uma imagem hospedada no bucket `media` do projeto Supabase atual (`qbwbipsjbqdqjhakiaji.supabase.co`) lançará erro em tempo de execução (`Invalid src prop ... hostname is not configured under images in your next.config.ts`). |
| **Confiança** | **Confirmado** |
| **Correção** | Atualizar `images.remotePatterns` em `next.config.ts` para incluir `qbwbipsjbqdqjhakiaji.supabase.co` (ou extrair dinamicamente de `new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname`). |
| **Validação** | Renderizar um componente `<Image />` apontando para uma URL pública de `qbwbipsjbqdqjhakiaji.supabase.co` e verificar carregamento sem erro. |

---

### MED-07 — Ausência Total de Headers de Segurança HTTP (CSP, HSTS, X-Frame-Options) e de Rate Limiting nas APIs

| Campo | Informação |
|---|---|
| **ID** | `MED-07` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`next.config.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/next.config.ts#L1-L17) e rotas em `src/app/api/**` |
| **Problema** | 1. `next.config.ts` não configura a função `headers()`, deixando a aplicação sem `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY` / `SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy`.<br>2. Nenhuma das rotas públicas de escrita (`/api/prayer`, `/api/prayer-request`, `/api/public/track`) nem a tela de login possuem controle de Rate Limiting. |
| **Evidência** | Inspeção completa de [`next.config.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/next.config.ts#L1-L17) e ausência de `vercel.json` ou middleware de rate limit. |
| **Impacto** | Vulnerabilidade a Clickjacking (iframe em site de terceiros), ausência de defesa em profundidade contra XSS e possibilidade de abuso por spam/flood de e-mails SMTP nos endpoints de pedido de oração. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Adicionar `async headers()` em `next.config.ts` definindo `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e `Strict-Transport-Security`.<br>2. Implementar limitador de taxa por IP nas rotas `/api/prayer` e `/api/public/track`. |
| **Validação** | Inspecionar os cabeçalhos HTTP de resposta (`curl -I`) e confirmar a presença dos headers de segurança. |

---

### MED-08 — Exposição de Detalhes Internos de Exceções (`error.message`) nas Respostas das Rotas de API

| Campo | Informação |
|---|---|
| **ID** | `MED-08` |
| **Gravidade** | **MÉDIO** |
| **Localização** | [`src/app/api/admin/settings/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L31-L62), [`src/app/api/import/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/import/route.ts#L131), [`src/app/api/mcp/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/mcp/route.ts#L30), [`src/app/api/n8n/sync-events/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L59), [`src/app/api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L99) e [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L103) |
| **Problema** | Todos os Route Handlers capturam exceções do Supabase/PostgreSQL/Nodemailer e retornam `error.message` diretamente no corpo JSON da resposta HTTP `500` (ou `200` com `warning: emailError.message` em `/api/prayer-request`). |
| **Evidência** | Exemplo em [`src/app/api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L93-L96): retorna `warning: emailError.message` para o usuário final, revelando endereços de servidores SMTP, portas e códigos de erro de autenticação de e-mail. |
| **Impacto** | Enumeração de nomes de tabelas, constraints do PostgreSQL e topologia de serviços internos por atacantes. |
| **Confiança** | **Confirmado** |
| **Correção** | Registrar o erro detalhado apenas no log do servidor (`console.error`) e retornar mensagens genéricas ao cliente (`"Erro interno ao processar sua solicitação"`). |
| **Validação** | Forçar um erro de banco/SMTP em ambiente de teste e verificar que a resposta JSON não contém detalhes internos de infraestrutura. |

---

### LOW-01 — Chaves Hardcoded em Scripts Locais (`scripts/check-home-js.js`) e Dump de Schema `openapi.json` no Workspace

| Campo | Informação |
|---|---|
| **ID** | `LOW-01` |
| **Gravidade** | **BAIXO** |
| **Localização** | [`scripts/check-home-js.js`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/check-home-js.js#L3-L4) (linhas 3–4) e [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) |
| **Problema** | 1. O arquivo [`scripts/check-home-js.js`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/scripts/check-home-js.js#L3-L4) contém a URL do Supabase e o token JWT `anon` hardcoded no código-fonte.<br>2. O arquivo [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) na raiz do diretório contém o dump completo da especificação OpenAPI/PostgREST do banco de produção. |
| **Evidência** | Leitura direta de `scripts/check-home-js.js` (linhas 3–4) e `openapi.json`. |
| **Impacto** | Risco de versionamento acidental (`git add .`) de dumps de schema e chaves no repositório Git. |
| **Confiança** | **Confirmado** |
| **Correção** | Substituir as constantes hardcoded em `scripts/check-home-js.js` por `process.env.NEXT_PUBLIC_SUPABASE_URL` e `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`, remover `openapi.json` da raiz e adicionar `openapi.json` ao `.gitignore`. |
| **Validação** | Verificar que `grep -rn "eyJhbGci" scripts/ src/` não retorna nenhuma ocorrência. |

---

### LOW-02 — Artefatos Legados do Astro em `.vercel/output` e Arquivo Binário `._page.tsx` Causando 1.131 Alertas/Erros no ESLint

| Campo | Informação |
|---|---|
| **ID** | `LOW-02` |
| **Gravidade** | **BAIXO** |
| **Localização** | `.vercel/output/` e `src/app/(public)/quem-somos/historia-diocese/._page.tsx` |
| **Problema** | 1. O diretório `.vercel/output/` contém um build antigo em **Astro** (`_astro`, `_functions/pages/index.astro.mjs`), que não é ignorado pelo `eslint.config.mjs`.<br>2. Existe um arquivo de metadados macOS AppleDouble (`._page.tsx`) dentro de `src/app/(public)/quem-somos/historia-diocese/`, que o ESLint e o Next.js tentam analisar como código TypeScript válido, gerando `Parsing error: Invalid character`. |
| **Evidência** | Saída do comando `npm run lint`: `✖ 1131 problems (209 errors, 922 warnings)`, sendo a grande maioria oriunda de `.vercel/output/**` e o erro de sintaxe de `src/app/(public)/quem-somos/historia-diocese/._page.tsx`. |
| **Impacto** | Quebra da esteira de linting (`npm run lint`) e risco de deploy incorreto caso `vercel deploy --prebuilt` seja executado usando `.vercel/output` obsoleto. |
| **Confiança** | **Confirmado** |
| **Correção** | 1. Remover `._*` de `src/` e adicionar `._*` e `.vercel/**` ao `.gitignore` e ao `globalIgnores` de `eslint.config.mjs`.<br>2. Remover o diretório `.vercel/output` legado. |
| **Validação** | Executar `npm run lint` e verificar que `.vercel/` e `._*` não são processados. |

---

### LOW-03 — Funcionalidade de Pedido de Oração Quebrada no Portal Público (Link `/contato#pedido-oracao` sem Formulário)

| Campo | Informação |
|---|---|
| **ID** | `LOW-03` |
| **Gravidade** | **BAIXO** |
| **Localização** | [`src/app/(public)/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/page.tsx#L26) (linha 26) e [`src/app/(public)/contato/ContatoClient.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/contato/ContatoClient.tsx#L1-L263) |
| **Problema** | A página inicial possui o botão de destaque *"PEDIDO DE ORAÇÃO"* apontando para `/contato#pedido-oracao` (linha 26 de `src/app/(public)/page.tsx`). Além disso, existem duas rotas de backend (`/api/prayer` e `/api/prayer-request`) e uma tela no painel admin (`/admin/dashboard/pedidos`). Contudo, a página [`ContatoClient.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/contato/ContatoClient.tsx#L31-L50) possui apenas um formulário genérico de contato (que grava em `contact_submissions` diretamente via cliente Supabase) e **não possui nenhuma seção `#pedido-oracao` nem chama `/api/prayer`**. |
| **Evidência** | Busca global no código (`src/`) mostra que nenhuma página ou componente faz `fetch('/api/prayer')` ou `fetch('/api/prayer-request')`, nem define `id="pedido-oracao"`. |
| **Impacto** | Os fiéis que clicam em "Pedido de Oração" na Home caem em um formulário comum de contato; a tabela `prayer_requests`, o painel `/admin/dashboard/pedidos`, os e-mails de intercessão e o webhook N8N de oração nunca são acionados pelo site. |
| **Confiança** | **Confirmado** |
| **Correção** | Adicionar a seção/aba `#pedido-oracao` em `ContatoClient.tsx` (ou página dedicada) conectada via `POST /api/prayer` para gravar em `prayer_requests` e disparar a notificação de intercessão. |
| **Validação** | Clicar em "Pedido de Oração" na Home, enviar um pedido e confirmar que ele aparece em `/admin/dashboard/pedidos`. |

---

### LOW-04 — Elementos de Interface Inativos (Busca/Paginação no Blog, Botões em Eventos) e Rotas Órfãs na Sidebar Admin

| Campo | Informação |
|---|---|
| **ID** | `LOW-04` |
| **Gravidade** | **BAIXO** |
| **Localização** | [`src/app/(public)/blog/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/blog/page.tsx#L51-L99) (linhas 51–55 e 97–99), [`src/app/(public)/eventos/[id]/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/eventos/%5Bid%5D/page.tsx#L101-L124) (linhas 101–103 e 122–124) e [`src/components/app-sidebar.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/app-sidebar.tsx#L30-L82) |
| **Problema** | 1. Em `/blog` ([`blog/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/blog/page.tsx#L51-L99)), o campo `<input placeholder="Buscar no blog..." />` e o botão `"Carregar mais postagens"` são puramente estáticos (sem estado, `onChange` ou paginação).<br>2. Em `/eventos/[id]` ([`eventos/[id]/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(public)/eventos/%5Bid%5D/page.tsx#L101-L124)), os botões `"Compartilhar Convite"` e `"Ver no Google Maps"` não possuem `onClick` nem `href`.<br>3. Na barra lateral administrativa ([`app-sidebar.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/app-sidebar.tsx#L30-L82)), existem páginas implementadas no dashboard que **não aparecem no menu**: `/admin/dashboard/pedidos` (Pedidos de Oração), `/admin/dashboard/eventos` (Eventos), `/admin/dashboard/diocesana` (História na Diocese) e `/admin/status`. |
| **Evidência** | Inspeção direta de `src/app/(public)/blog/page.tsx`, `src/app/(public)/eventos/[id]/page.tsx` e `src/components/app-sidebar.tsx`. |
| **Impacto** | Frustração de usuários ao clicar em botões sem ação no portal público e dificuldade de navegação para administradores encontrarem páginas ocultas no painel. |
| **Confiança** | **Confirmado** |
| **Correção** | Implementar os handlers de busca/compartilhamento/mapa nas páginas públicas e incluir os links ausentes (`Pedidos de Oração`, `Eventos`, `História na Diocese`) em `src/components/app-sidebar.tsx`. |
| **Validação** | Verificar navegação completa no menu lateral administrativo e funcionamento dos botões em `/blog` e `/eventos/[id]`. |

---

### LOW-05 — Domínios de Produção Divergentes Hardcoded no Código (`site-rcc-rainhadapaz.vercel.app` vs `site-rcc-diocese.vercel.app`)

| Campo | Informação |
|---|---|
| **ID** | `LOW-05` |
| **Gravidade** | **BAIXO** |
| **Localização** | [`mcp-config.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/mcp-config.json#L5), [`src/app/(admin)/admin/dashboard/noticias/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/noticias/page.tsx#L118) e [`src/app/(admin)/admin/dashboard/configuracoes/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/configuracoes/page.tsx#L7) |
| **Problema** | Diferentes partes do projeto referenciam URLs base distintas: `mcp-config.json` aponta para `https://site-rcc-rainhadapaz.vercel.app/api/import`, enquanto `noticias/page.tsx` e `configuracoes/page.tsx` usam `https://site-rcc-diocese.vercel.app`. |
| **Evidência** | Comparação entre as strings de URL nos três arquivos. |
| **Impacto** | Links compartilhados nas redes sociais ou chamadas de automação MCP podem apontar para o projeto antigo da Paróquia Rainha da Paz em vez da Diocese de Sinop. |
| **Confiança** | **Confirmado** |
| **Correção** | Centralizar a URL base em `process.env.NEXT_PUBLIC_SITE_URL` e substituir todas as URLs hardcoded. |
| **Validação** | Verificar que todas as referências de URL de produção utilizam `NEXT_PUBLIC_SITE_URL`. |

---

### INFO-01 — Violações das Regras do React 19 Compiler/Hooks em `navbar.tsx` e `sidebar.tsx`

| Campo | Informação |
|---|---|
| **ID** | `INFO-01` |
| **Gravidade** | **INFORMATIVO** |
| **Localização** | [`src/components/public/navbar.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/public/navbar.tsx#L89-L92) (linha 91) e [`src/components/ui/sidebar.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/ui/sidebar.tsx#L610-L612) (linha 611) |
| **Problema** | O ESLint (`eslint-plugin-react-hooks` v7 para React 19) aponta 2 erros de regras de hooks:<br>1. `navbar.tsx:91`: chamada de função declarada após o `useEffect` que dispara `setState` (`react-hooks/set-state-in-effect`).<br>2. `sidebar.tsx:611`: chamada da função impura `Math.random()` dentro de `React.useMemo` durante a renderização (`react-hooks/purity`). |
| **Evidência** | Saída de `npm run lint` nos arquivos de `src/`. |
| **Impacto** | Possível diferença de hidratação (hydration mismatch) no componente `SidebarMenuSkeleton` e alertas no linter. |
| **Confiança** | **Confirmado** |
| **Correção** | Mover a definição de `fetchDynamicPages` para dentro do `useEffect` em `navbar.tsx` e substituir `Math.random()` por largura determinística em `sidebar.tsx`. |
| **Validação** | Executar `npx eslint src/` e confirmar ausência de erros `react-hooks/*`. |

---

### INFO-02 — Uso de `Math.random()` para Identificadores de Sessão e Nomes de Arquivos em Storage

| Campo | Informação |
|---|---|
| **ID** | `INFO-02` |
| **Gravidade** | **INFORMATIVO** |
| **Localização** | [`src/components/public/PageTracker.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/components/public/PageTracker.tsx#L14) (linha 14) e páginas administrativas de upload |
| **Problema** | `Math.random()` (PRNG não criptográfico) é utilizado para gerar identificadores de sessão no `PageTracker` e nomes de arquivos no bucket `media` (em `ministerios/page.tsx`, apenas `Math.random()` sem timestamp é usado: `` `${Math.random()}.${fileExt}` ``). |
| **Evidência** | Linhas 81 e 105 de [`src/app/(admin)/admin/dashboard/ministerios/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/ministerios/page.tsx#L81-L105). |
| **Impacto** | Baixa entropia e possibilidade eventual de colisão de nomes de arquivos no Storage. |
| **Confiança** | **Confirmado** |
| **Correção** | Utilizar `crypto.randomUUID()` nativo da Web Crypto API. |
| **Validação** | Verificar substituição de `Math.random()` por `crypto.randomUUID()` nos geradores de IDs e nomes de arquivos. |

---

## D. Mapa das APIs e Interfaces de Servidor

Abaixo está o inventário completo de todos os **Route Handlers**, **Server Actions**, **Server Components com acesso a dados sensíveis** e **Endpoints RPC do Supabase** identificados no projeto:

| Método | Caminho / Interface | Arquivo | Finalidade | Autenticação Esperada | Autenticação Real no Servidor | Permissões / Chave Usada | Status da Análise | Problemas Identificados |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `POST` (Server Action) | `/admin/dashboard/sql` (`executeSQL`) | [`sql/actions.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/sql/actions.ts#L12) | Executar SQL bruto no banco via RPC `exec_raw_sql` | Admin Autenticado | ❌ **NENHUMA** | `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **CRÍTICO** | `CRIT-01`: Qualquer usuário sem login pode executar SQL arbitrário (`DROP`, `SELECT`, `ALTER`) via POST na Server Action. |
| `GET` | `/api/admin/settings` | [`api/admin/settings/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L12) | Ler todas as configurações de `system_settings` | Admin Autenticado | ❌ **NENHUMA** | `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **CRÍTICO** | `CRIT-02`, `MED-08`: Expõe `n8n_api_key` e `n8n_webhook_url` para qualquer usuário não autenticado. |
| `POST` | `/api/admin/settings` | [`api/admin/settings/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/admin/settings/route.ts#L36) | Criar/atualizar chaves em `system_settings` | Admin Autenticado | ❌ **NENHUMA** | `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **CRÍTICO** | `CRIT-02`, `MED-08`: Permite sobrescrever `n8n_webhook_url` sem login e induzir SSRF com envio de `N8N_API_KEY`. |
| `POST` | `/api/n8n/sync-events` | [`api/n8n/sync-events/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L10) | Sincronizar eventos vindos do N8N | Bearer `N8N_API_KEY` | ⚠️ **BYPASSÁVEL** (`Bearer undefined`) | `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **CRÍTICO** | `CRIT-04`, `HIGH-02`, `MED-08`: Não checa se `N8N_API_KEY` está definida; aceita `Bearer undefined` e insere HTML sem sanitização. |
| `POST` | `/api/import` | [`api/import/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/import/route.ts#L17) | Importar notícias (`posts`) e eventos (`events`) via automação | Bearer `MCP_AUTH_TOKEN` | ✅ Sim (porém token vaza em `HIGH-01`) | `SUPABASE_SERVICE_ROLE_KEY` | 🟠 **ALTO** | `HIGH-01`, `HIGH-02`, `MED-08`: O token `MCP_AUTH_TOKEN` é vazado no RSC payload de `/admin/dashboard/configuracoes`. Não sanitiza HTML de `content`/`description`. |
| `POST` | `/api/mcp` | [`api/mcp/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/mcp/route.ts#L7) | Endpoint HTTP para servidor Model Context Protocol | Bearer `MCP_AUTH_TOKEN` | ✅ Sim (porém token vaza em `HIGH-01`) | `SUPABASE_SERVICE_ROLE_KEY` | 🟡 **QUEBRADA (500)** | `MED-03`, `HIGH-01`, `MED-08`: Chama `mcpServer.handleRequest(body)`, método inexistente no SDK MCP, resultando sempre em erro `500`. |
| `POST` | `/api/prayer` | [`api/prayer/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer/route.ts#L7) | Receber pedido de oração, gravar no banco, disparar N8N e enviar e-mail | Pública | Pública (sem Rate Limit) | `SUPABASE_ANON_KEY` | 🟡 **MÉDIO** | `MED-01`, `MED-07`, `MED-08`, `LOW-03`: Duplicada com `/api/prayer-request`, vulnerável a HTML Injection no e-mail, bug `SMTP_PASS` vs `SMTP_PASSWORD`, retorna linha inserida e não é chamada pelo frontend. |
| `POST` | `/api/prayer-request` | [`api/prayer-request/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/prayer-request/route.ts#L11) | Receber pedido de oração, gravar no banco, disparar N8N e enviar e-mail | Pública | Pública (sem Rate Limit) | `SUPABASE_ANON_KEY` | 🟡 **MÉDIO** | `MED-01`, `MED-02`, `MED-07`, `MED-08`, `LOW-03`: Desativa verificação de certificado TLS (`rejectUnauthorized: false`), não valida campos obrigatórios e vaza `emailError.message`. |
| `POST` | `/api/public/track` | [`api/public/track/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/public/track/route.ts#L11) | Incrementar contador de visualizações de página (`page_views`) | Pública | Pública (sem Rate Limit) | `SUPABASE_SERVICE_ROLE_KEY` | 🟡 **MÉDIO** | `MED-04`, `MED-07`: RPC `increment_page_view` não existe no banco; cai sempre em fallback não-atômico de 2 queries e aceita qualquer `slug` sem validação. |
| `GET` (RSC) | `/admin/dashboard/configuracoes` | [`configuracoes/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/configuracoes/page.tsx#L5) | Renderizar página de configurações e chave MCP | Admin Autenticado | ❌ **NENHUMA NO SERVIDOR** (Apenas Client `AuthGuard`) | `process.env.MCP_AUTH_TOKEN` | 🟠 **ALTO** | `HIGH-01`: Serializa `MCP_AUTH_TOKEN` no payload RSC antes da execução do `AuthGuard` no navegador. |
| `GET` (RSC) | `/admin/dashboard/pedidos` | [`pedidos/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/pedidos/page.tsx#L6) | Listar pedidos de oração dos fiéis | Admin Autenticado | ❌ **NENHUMA NO SERVIDOR** (Apenas Client `AuthGuard`) | `SUPABASE_ANON_KEY` (com RLS aberta) | 🟠 **ALTO** | `HIGH-01`, `CRIT-03`: Retorna todos os pedidos de oração (nome, telefone, e-mail, mensagem) no payload RSC para requisições sem autenticação. |
| `GET` (Client) | `/admin/status` | [`admin/status/page.tsx`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/status/page.tsx#L15) | Painel de diagnóstico de tabelas e `sync_logs` | Admin Autenticado | ❌ **NENHUMA** (Fora do `AuthGuard`) | `SUPABASE_ANON_KEY` | 🟠 **ALTO** | `HIGH-01`: Rota administrativa fora do layout de `/admin/dashboard`, acessível publicamente até mesmo no navegador. |
| `POST` (PostgREST) | `https://...supabase.co/rest/v1/rpc/exec_raw_sql` | [`openapi.json`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/openapi.json#L1) | RPC PostgreSQL para execução de SQL dinâmico | Nenhuma (Não deveria existir) | Exposta no PostgREST | Definida no banco | 🔴 **CRÍTICO** | `CRIT-01`: Deve ser removida (`DROP FUNCTION`) imediatamente do banco Supabase. |

---

## E. Plano de Correção

As correções foram estruturadas em três fases sequenciais, priorizando a contenção imediata dos riscos críticos com mudanças cirúrgicas que preservam 100% das funcionalidades existentes do portal.

### FASE 1 — Segurança Crítica (Contenção Imediata)

| Ordem | ID | Ação Recomendada | Complexidade |
| :---: | :--- | :--- | :---: |
| **1º** | `CRIT-01` | **Remover a execução remota de SQL:** Excluir a Server Action [`src/app/(admin)/admin/dashboard/sql/actions.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/(admin)/admin/dashboard/sql/actions.ts) (ou bloqueá-la imediatamente) e remover a função `public.exec_raw_sql` no banco de dados Supabase (`DROP FUNCTION IF EXISTS public.exec_raw_sql(text);`). | Baixa (15 min) |
| **2º** | `CRIT-03` | **Corrigir as Políticas RLS no Supabase:** Aplicar script SQL corretivo restringindo `SELECT` em `prayer_requests` e `contact_submissions` exclusivamente a `TO authenticated USING (auth.role() = 'authenticated')`, revogando acesso de `anon` a `system_settings` e `sync_logs`, e restringindo `INSERT`, `UPDATE` e `DELETE` em todas as tabelas públicas (`posts`, `events`, `groups`, `ministerios`, `foranias`, `custom_pages`, `site_settings`, `gallery`, etc.) e no bucket `media` apenas para `TO authenticated`. | Baixa (30 min) |
| **3º** | `CRIT-02` & `HIGH-01` | **Implementar Autenticação Server-Side (`@supabase/ssr` + `src/middleware.ts`):** Migrar o cliente Supabase para `@supabase/ssr` (baseado em cookies seguros), criar `src/middleware.ts` protegendo `/admin/dashboard/:path*`, `/admin/status` e `/api/admin/:path*` no servidor, exigir sessão válida em `GET`/`POST /api/admin/settings` e remover a passagem de `process.env.MCP_AUTH_TOKEN` para o cliente em `configuracoes/page.tsx`. | Média (2 h) |
| **4º** | `CRIT-04` | **Corrigir o Bypass em `/api/n8n/sync-events`:** Exigir que `process.env.N8N_API_KEY` esteja definido e não vazio antes de validar o header `Authorization: Bearer ...` em [`src/app/api/n8n/sync-events/route.ts`](file:///Volumes/Gelson%20HD/GeminiLocal/RCC%20Diocese%20Sinop/src/app/api/n8n/sync-events/route.ts#L13). | Baixa (10 min) |
| **5º** | `HIGH-02` | **Sanitizar HTML nas Páginas Públicas:** Criar helper `sanitizeHtml()` e aplicá-lo antes de `parse()` em `/blog/[slug]`, `/eventos/[id]`, `/p/[slug]` e `/festa-rei-jesus`. | Baixa (30 min) |
| **6º** | `HIGH-03` & `HIGH-04` | **Blindar Workflow GitHub Actions e N8N Client:** Mover `${{ github.event.inputs.* }}` para variáveis `env:` validadas em `.github/workflows/sync-history.yml` e mover `shareToSocialMedia` para execução exclusiva no servidor. | Baixa (30 min) |

### FASE 2 — Estabilidade, APIs e Dependências

| Ordem | ID | Ação Recomendada | Complexidade |
| :---: | :--- | :--- | :---: |
| **7º** | `HIGH-06` | **Atualizar Dependências Vulneráveis:** Atualizar `next`, `@modelcontextprotocol/sdk`, `@tiptap/*`, `nodemailer` e executar `npm audit fix`. | Baixa (30 min) |
| **8º** | `MED-05` & `MED-06` | **Corrigir Build TypeScript e `next.config.ts`:** Corrigir a tipagem de `curr.settings_key` em `src/lib/n8n.ts:18` e atualizar o hostname do Supabase em `next.config.ts` para `qbwbipsjbqdqjhakiaji.supabase.co`. | Baixa (15 min) |
| **9º** | `MED-01`, `MED-02` & `LOW-03` | **Unificar e Corrigir o Fluxo de Pedido de Oração:** Consolidar `/api/prayer` e `/api/prayer-request` (com `escapeHtml`, TLS válido, variável `SMTP_PASS` padronizada e validação `zod`) e adicionar o formulário `#pedido-oracao` na página `/contato` conectado à API. | Média (1 h) |
| **10º** | `MED-03` & `MED-04` | **Restaurar `/api/mcp` e `/api/public/track`:** Implementar o handler JSON-RPC/transporte correto em `/api/mcp`, criar a RPC atômica `increment_page_view` no Supabase e validar o formato de `slug` em `/api/public/track`. | Média (1 h) |
| **11º** | `HIGH-05`, `MED-07` & `MED-08` | **Configurar Security Headers, Rate Limiting, Limites de Upload e Ocultar Erros Internos:** Adicionar headers HTTP de segurança em `next.config.ts`, restringir MIME types/tamanho no bucket `media` e padronizar respostas de erro genéricas nas APIs. | Média (1 h) |

### FASE 3 — Melhorias, Qualidade de Código e Manutenção Preventiva

| Ordem | ID | Ação Recomendada | Complexidade |
| :---: | :--- | :--- | :---: |
| **12º** | `LOW-01` & `LOW-02` | **Limpeza do Repositório e Linter:** Remover `openapi.json`, `.vercel/output` legado e `src/app/(public)/quem-somos/historia-diocese/._page.tsx`, remover a chave hardcoded de `scripts/check-home-js.js` e atualizar `.gitignore` e `eslint.config.mjs`. | Baixa (20 min) |
| **13º** | `LOW-04` & `LOW-05` | **Completar UI Pública, Menu Admin e Padronizar URLs:** Adicionar os links ausentes (`Pedidos de Oração`, `Eventos`, `História na Diocese`) em `app-sidebar.tsx`, ativar busca/paginação em `/blog` e botões em `/eventos/[id]`, e centralizar `NEXT_PUBLIC_SITE_URL`. | Média (1 h) |
| **14º** | `INFO-01` & `INFO-02` | **Refinamentos de React 19 e Web Crypto:** Ajustar `useEffect` em `navbar.tsx`, remover `Math.random()` de `sidebar.tsx` e usar `crypto.randomUUID()` nos uploads. | Baixa (20 min) |

