# Maonamassa — frontend

> README **provisório**, só da parte de **frontend** (Alexandre). Serve de guia para o grupo; o
> README final será escrito por um integrante.

App mobile que conecta prestadores de serviço autônomos a clientes, com foco em segurança:
perfis verificados, filtro de preferência de gênero e botão de segurança.
Projeto Integrador — ADS, Senac Santo Amaro, 2026.

> **Dados de exemplo são só para visualização.** Os prestadores, serviços e solicitações de
> `src/mocks/` saem quando o backend e o banco entrarem. A partir daí, tudo vem do uso real do app
> (cadastros, serviços publicados e contratações).

## Tarefas do grupo

| Tarefa                      | Responsáveis      | O que entregar                                                                   |
| --------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| Telas / frontend            | Alexandre         | ✅ Entregue e testado (ver `qa/RELATORIO-QA.md`)                                 |
| Cap. 4 — Protótipo no Figma | Gui e Claudia     | Telas da tabela abaixo, com a identidade do app (coral `#E85D5D`, Poppins)       |
| Diagrama do banco           | Pamela e Gui      | DER com usuários, prestadores, serviços, solicitações e avaliações               |
| Banco + tabelas             | Pamela e Gui      | Script SQL. Não copiar os dados de exemplo de `src/mocks/`                       |
| Backend                     | Anderson e Maycon | Supabase: banco, regras de acesso e funções em [`supabase/`](supabase/README.md) |
| Conclusão                   | _a definir_       | Entregas, dificuldades e próximos passos                                         |
| README final                | _a definir_       | Substituir este arquivo                                                          |

## Como rodar

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Sem configuração, o app roda em modo demonstração.

| Perfil    | E-mail                     | Senha    |
| --------- | -------------------------- | -------- |
| Cliente   | `cliente@maonamassa.dev`   | `123456` |
| Prestador | `prestador@maonamassa.dev` | `123456` |

Contas de demonstração existem só nos dados de exemplo.

## Testes

```bash
npm test           # 39 testes unitários (Vitest)
npm run test:e2e   # 15 testes de ponta a ponta (Playwright, usa o Microsoft Edge instalado)
npm run lint
```

Plano, bugs e relatório de QA ficam em [`qa/`](qa/RELATORIO-QA.md).

## Telas

| Rota                       | Tela                                         |
| -------------------------- | -------------------------------------------- |
| `/`                        | Início: busca, categorias e filtros          |
| `/servicos`                | Profissionais: lista com filtros e ordenação |
| `/servicos/:id`            | Detalhe do serviço                           |
| `/servicos/:id/contratar`  | Contratação (exige login)                    |
| `/agenda`                  | Agenda: solicitações e botão de segurança    |
| `/perfil`                  | Perfil e preferências                        |
| `/login`, `/cadastro`      | Login e cadastro (cliente ou prestador)      |
| `/prestador/servicos/novo` | Cadastro de serviço (prestador)              |

## Estrutura

React 19 + Vite, Tailwind CSS, React Router, React Hook Form + Zod, TanStack Query.

```
src/
├── features/   # auth, services, hiring (contratação e agenda), profile
├── components/ # layout e componentes visuais
├── mocks/      # dados de exemplo (saem com o backend)
└── lib/        # cliente HTTP, máscaras, validações
```

As telas chamam `src/features/*/api`, que usam o **Supabase** como backend (banco, login e
arquivos). O banco e as regras de segurança estão em [`supabase/`](supabase/README.md).

Sem configuração, o app roda com os dados de exemplo de `src/mocks/`. Para usar o banco de
verdade, crie um `.env.local` (modelo em `.env.example`):

```bash
VITE_USE_MOCKS=false
VITE_SUPABASE_URL=https://rcwftcbaantadkhjexoc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```


## Publicação

Importe o repositório na Vercel (preset Vite) e cadastre as mesmas variáveis do `.env.local` em
Settings > Environment Variables. O `vercel.json` já trata as rotas do app.
