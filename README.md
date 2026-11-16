# Maonamassa — Guia do frontend e das tarefas do grupo

> **Atenção:** este README é provisório e cobre **apenas a parte de frontend** (feita pelo
> Alexandre). Ele serve de **guia para o grupo**: explica como o app funciona e o que cada frente
> precisa entregar. O README final do projeto será escrito por um integrante (ver
> [Divisão de tarefas](#divisão-de-tarefas)).

Maonamassa é uma plataforma mobile que conecta prestadores de serviço autônomos (eletricistas,
encanadoras, diaristas, pedreiros...) a clientes, **com foco em segurança**: perfis verificados,
filtro de preferência de gênero e botão de segurança durante o atendimento.

Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas (Centro Universitário Senac
Santo Amaro, 2026).

> **Dados de exemplo são só para visualização.** Os prestadores, serviços, avaliações e
> solicitações que aparecem hoje no app (pasta `src/mocks/`) existem apenas para demonstrar as
> telas. Eles **serão removidos quando o backend e o banco de dados entrarem**: a partir daí,
> tudo o que aparece no app virá do banco, preenchido pelo próprio uso (cadastros de usuários,
> publicação de serviços, contratações e avaliações).

---

## Divisão de tarefas

| Tarefa                          | Responsáveis    | Status       |
| ------------------------------- | --------------- | ------------ |
| Telas / frontend                | Alexandre       | ✅ Entregue (ver pendências abaixo) |
| Cap. 4 — Protótipo no Figma     | Gui e Claudia   | ⏳ A fazer   |
| Diagrama do banco               | Pamela e Gui    | ⏳ A fazer   |
| Criação do banco + tabelas      | Pamela e Gui    | ⏳ A fazer   |
| Backend (API)                   | Anderson e Maycon | ⏳ A fazer |
| Conclusão                       | _a definir_     | ⏳ A fazer   |
| README final                    | _a definir_     | ⏳ A fazer   |

### 1. Telas / frontend — Alexandre

Entregue:

- [x] Tela principal (busca, categorias, filtros "Só mulheres" e "Verificados")
- [x] Login e cadastro (cliente e prestador, com envio de documento)
- [x] Cadastro de serviço (prestador)
- [x] Profissionais (listagem com filtros e ordenação)
- [x] Detalhe do serviço e contratação (demonstrativa, sem cobrança)
- [x] Agenda (solicitações, aceitar/recusar, cancelar, concluir, botão de segurança)
- [x] Perfil (dados, preferência de gênero, meus serviços, sair)
- [x] Camada de API pronta para o backend ([`docs/API.md`](docs/API.md))

Pendências que dependem de outras frentes:

- [ ] Ligar no backend real (trocar `VITE_USE_MOCKS` para `false`) quando a API existir
- [ ] Recuperação de senha, edição de dados do perfil e avaliação após o serviço (precisam de
      endpoints no backend)
- [ ] Páginas de Termos de Uso e Política de Privacidade (texto a definir pelo grupo)
- [ ] Ajustes finos para ficar igual ao protótipo do Figma, quando ele estiver pronto

### 2. Cap. 4 — Protótipo no Figma — Gui e Claudia

O que fazer:

- [ ] Prototipar as telas que já existem no app (tabela [Telas](#telas)), para o capítulo 4
- [ ] Seguir a identidade aprovada: coral `#E85D5D`, fundo `#F5F5F8`, fonte **Poppins**,
      cabeçalhos com curva inferior, ícones em emoji e barra inferior coral
- [ ] Ligar as telas no modo protótipo do Figma, seguindo os fluxos: busca → detalhe → contratar →
      confirmação; cadastro → login; agenda → botão de segurança
- [ ] Usar o app rodando (ver [Como rodar](#como-rodar)) como referência e tirar prints se ajudar

### 3. Diagrama do banco — Pamela e Gui

O frontend já define quais dados existem. Sugestão de entidades, a partir dos campos usados nas
telas e do contrato em [`docs/API.md`](docs/API.md):

| Entidade                 | Campos principais |
| ------------------------ | ----------------- |
| `usuarios`               | id, tipo (`cliente`/`prestador`), nome, email (único), cpf (único), telefone, genero, senha_hash, prefere_mulheres, criado_em |
| `prestadores`            | usuario_id (1:1), bio, experiencia, raio_atendimento_km, cep, bairro, cidade, verificado, atende_preferencialmente_mulheres, nota_media, servicos_concluidos |
| `categorias`             | slug, nome (eletrica, hidraulica, pintura, alvenaria, manutencao, montagem, limpeza, jardinagem) |
| `prestador_especialidades` | prestador_id, categoria_slug (N:N) |
| `documentos`             | id, prestador_id, arquivo_url, status (`pendente`/`aprovado`/`recusado`), enviado_em |
| `servicos`               | id, prestador_id, categoria_slug, tipo, titulo, descricao, valor, unidade_cobranca (`servico`/`hora`/`visita`), criado_em |
| `servico_itens_inclusos` | id, servico_id, descricao |
| `solicitacoes` (OS)      | id, servico_id, cliente_id, status, data, periodo, cep, rua, numero, complemento, bairro, detalhes, forma_pagamento, valor_estimado, contato_confianca_nome, contato_confianca_telefone, criado_em |
| `avaliacoes`             | id, solicitacao_id, prestador_id, cliente_id, nota (1–5), comentario, criado_em |

- [ ] Fazer o diagrama (DER) com relacionamentos e cardinalidades
- [ ] Validar com o backend antes de criar as tabelas

### 4. Criação do banco + tabelas — Pamela e Gui

- [ ] Script SQL de criação das tabelas (chaves estrangeiras, índices em email/cpf, restrições de
      status)
- [ ] Inserir apenas os dados fixos (ex.: tabela `categorias`). **Não copiar os dados de exemplo
      de `src/mocks/`**: prestadores, serviços e contratações devem entrar pelo uso do app
- [ ] Se for preciso popular o banco para a apresentação, fazer isso pelo próprio app ou por um
      script separado, marcado como dados de teste
- [ ] Combinar com o backend o banco usado (MySQL/PostgreSQL) e onde ele vai ficar hospedado

### 5. Backend — Anderson e Maycon

- [ ] Implementar os endpoints de [`docs/API.md`](docs/API.md): mesmos caminhos, campos e
      formatos de resposta. Assim o frontend funciona sem mudanças
- [ ] Autenticação com token (JWT) no header `Authorization: Bearer <token>`
- [ ] Senhas com hash (bcrypt), validação de CPF e e-mail únicos
- [ ] Upload do documento do prestador (multipart) e status de verificação
- [ ] Regras de status das solicitações (tabela em `docs/API.md`)
- [ ] Erros no formato `{ "message": "texto para o usuário" }`
- [ ] Liberar CORS para o domínio do app na Vercel e para `http://localhost:5173`
- [ ] Passar a URL da API para o Alexandre configurar `VITE_API_URL`

### 6. Conclusão — a definir

Sugestão do que cobrir: o que foi entregue nesta etapa (frontend navegável, banco, API), as
dificuldades (ex.: equilibrar segurança e facilidade de cadastro), o que ficou para a próxima fase
(pagamento real com custódia, geolocalização, chat, notificações) e o aprendizado do grupo.

### 7. README final — a definir

O README final deve substituir este arquivo e incluir: apresentação do projeto, integrantes,
tecnologias de todas as camadas, como rodar frontend, backend e banco, link do app publicado e do
protótipo no Figma, e prints das telas.

---

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:5173.

| Comando           | O que faz                          |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento        |
| `npm run build`   | Build de produção em `dist/`       |
| `npm run preview` | Serve o build localmente           |
| `npm run lint`    | Verifica o código com ESLint       |
| `npm run format`  | Formata o código com Prettier      |
| `npm test`        | Roda os testes unitários (Vitest)  |

### Contas de demonstração (somente modo mock)

Enquanto não há backend, o app usa os dados de exemplo salvos no `localStorage` do navegador.

| Perfil    | E-mail                     | Senha    |
| --------- | -------------------------- | -------- |
| Cliente   | `cliente@maonamassa.dev`   | `123456` |
| Prestador | `prestador@maonamassa.dev` | `123456` |

Contas criadas pelo cadastro também funcionam no login, no mesmo navegador. Para zerar os dados,
limpe o `localStorage` do site. Essas contas deixam de existir quando o backend entrar.

## Telas

Todas as telas são do frontend (Alexandre).

| Rota                            | Tela |
| ------------------------------- | ---- |
| `/`                             | Tela principal: busca, categorias, filtros e serviços em destaque |
| `/servicos`                     | Profissionais: listagem com filtros por categoria, mulheres, verificados e ordenação |
| `/servicos/:id`                 | Detalhe do serviço |
| `/servicos/:id/contratar`       | Contratação (exige login) |
| `/contratacoes/:id/confirmacao` | Confirmação da solicitação (demonstrativa) |
| `/agenda`                       | Agenda: próximos e histórico, ações por status e botão de segurança |
| `/perfil`                       | Perfil: dados, preferência de gênero, meus serviços e sair |
| `/login`                        | Login |
| `/cadastro`                     | Cadastro com alternador "Sou Cliente / Sou Prestador" (`?tipo=prestador`) |
| `/prestador/servicos/novo`      | Cadastro de serviço (só prestador) |

## Arquitetura do frontend

| Camada              | Tecnologia |
| ------------------- | ---------- |
| Build e dev server  | Vite |
| UI                  | React 19 + JavaScript |
| Estilo              | Tailwind CSS v4 (tokens em `src/styles/index.css`) |
| Rotas               | React Router (com carregamento por rota) |
| Formulários         | React Hook Form + Zod |
| Dados do servidor   | TanStack Query + cliente HTTP em `src/lib/http.js` |
| Qualidade           | ESLint, Prettier, Vitest |

O código é organizado **por funcionalidade**:

```
src/
├── app/                 # App (providers) e rotas
├── components/
│   ├── layout/          # Coluna mobile, barra inferior, cabeçalho curvo, ações fixas
│   └── ui/              # Botões, campos, cards, alertas, painel inferior, interruptor
├── config/env.js        # Variáveis de ambiente
├── constants/           # Rotas e categorias de serviço
├── features/
│   ├── auth/            # Login, cadastro, sessão, rota protegida
│   ├── services/        # Home, Profissionais, detalhe, cadastro de serviço
│   ├── hiring/          # Contratação, confirmação e Agenda
│   └── profile/         # Perfil
├── lib/                 # http, máscaras, validadores (CPF), formatação
├── mocks/               # Dados de exemplo e backend simulado (sai quando o backend entrar)
└── styles/index.css     # Tailwind e tokens de design
```

```
Tela → hook (TanStack Query) → features/*/api → withMock → mocks/handlers   (VITE_USE_MOCKS=true)
                                                        ↘ lib/http → backend (VITE_USE_MOCKS=false)
```

- As telas nunca chamam `fetch` direto: usam os hooks de cada feature.
- `lib/http.js` envia o token, padroniza erros e encerra a sessão em respostas `401`.

## Integração com o backend

O contrato (endpoints, campos e respostas) está em [`docs/API.md`](docs/API.md). Quando a API
estiver no ar:

```bash
# .env.local (ou variáveis de ambiente na Vercel)
VITE_API_URL=https://sua-api/api
VITE_USE_MOCKS=false
```

Nenhuma tela precisa mudar. Depois de validar, a pasta `src/mocks/` pode ser apagada.

## Deploy na Vercel

1. Importe o repositório na Vercel (o preset **Vite** é detectado automaticamente).
2. Configure `VITE_API_URL` e `VITE_USE_MOCKS` em _Settings → Environment Variables_. Sem essas
   variáveis, o app sobe em modo demonstração.

O `vercel.json` já redireciona todas as rotas para o `index.html`.

## Decisões de UX

- **100% mobile**: coluna de até 480px. Em tablet e desktop ela fica centralizada sobre fundo
  lilás, com tamanho de celular.
- **Identidade do protótipo aprovado**: coral `#E85D5D`, Poppins, cabeçalhos curvos, ícones em
  emoji, barra inferior coral e botões em pílula.
- **Segurança visível**: selo de identidade verificada, selo e filtro de profissional mulher,
  contato de confiança na contratação, botão de segurança na Agenda e aviso de pagamento retido até
  a conclusão.
- **Movimento com função**: entrada de páginas e listas, hovers, feedback de toque e painéis que
  sobem do rodapé. Tudo desligado com `prefers-reduced-motion`.
- **Formulários**: mensagens em português, máscaras de CPF, celular e CEP, e validação real do CPF.
