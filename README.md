# Maonamassa

> Encontre prestadores de serviço verificados perto de você, com segurança.

**Demonstração:** https://app-maonamassa.vercel.app

O Maonamassa é um aplicativo web mobile-first que conecta clientes a prestadores de serviço autônomos (elétrica, hidráulica, pintura, alvenaria, manutenção, montagem, limpeza e jardinagem). O foco é a **segurança** de quem contrata e de quem presta o serviço:

- **Perfis verificados:** o prestador envia um documento no cadastro e recebe o selo de verificado.
- **Preferência de gênero:** a cliente pode dar preferência a prestadoras, e a prestadora pode escolher atender somente mulheres.
- **Botão de segurança:** durante a visita, avisa um contato de emergência e compartilha os dados do atendimento.
- **Pagamento retido:** o valor só é liberado ao prestador depois que o cliente confirma a conclusão do serviço.

Projeto Integrador do 2º semestre do curso de Análise e Desenvolvimento de Sistemas (ADS), Senac Santo Amaro, 2026.

---

## Sumário

- [Equipe](#equipe)
- [Situação do projeto](#situação-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Contas de demonstração](#contas-de-demonstração)
- [Telas e rotas](#telas-e-rotas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Integração com o backend](#integração-com-o-backend)
- [Testes e qualidade](#testes-e-qualidade)
- [Publicação](#publicação)
- [Documentação complementar](#documentação-complementar)
- [Conclusão](#conclusão)

---

## Equipe

| Integrante(s)      | Responsabilidade                                                                  |
| ------------------ | --------------------------------------------------------------------------------- |
| Alexandre          | Frontend (telas, testes e QA)                                                     |
| Gui e Claudia      | Protótipo no Figma (Cap. 4), com a identidade do app (coral `#E85D5D`, Poppins)   |
| Pamela e Gui       | Diagrama do banco (DER) e script SQL                                              |
| Anderson e Maycon  | Backend (API seguindo [`docs/API.md`](docs/API.md))                               |
| Airon              | README e conclusão                                                                |

## Situação do projeto

- **Frontend:** concluído e testado. Relatório em [`qa/RELATORIO-QA.md`](qa/RELATORIO-QA.md), com decisão **GO com ressalvas**.
- **Backend e banco:** a API deve seguir o contrato de [`docs/API.md`](docs/API.md), que é o que o frontend já espera. Enquanto ela não estiver no ar, o app roda em **modo demonstração**, com dados simulados em `src/mocks/`.
- **Pagamento:** nesta fase a contratação é demonstrativa e nenhum pagamento é processado.

> Os dados simulados de `src/mocks/` servem só para visualização. Eles **não** devem ser copiados para o banco. Com o backend no ar, os dados passam a vir do uso real do app: cadastros, serviços publicados e contratações.

## Funcionalidades

**Cliente**
- Buscar serviços por texto e categoria, com filtros (só verificados, só prestadoras) e ordenação por avaliação, distância ou preço.
- Ver os detalhes do serviço: o que está incluído, preço, avaliações e perfil do prestador.
- Contratar: data e período, endereço com CEP, detalhes, forma de pagamento (Pix ou cartão) e contato de emergência opcional.
- Acompanhar as solicitações na Agenda, cancelar, confirmar a conclusão e usar o botão de segurança.
- Ajustar perfil e preferências (preferência por prestadoras).

**Prestador**
- Cadastro com especialidades, experiência, raio de atendimento, bairro, bio e envio de documento (JPG, PNG ou PDF até 5 MB).
- Cadastrar serviços com categoria, título, descrição, preço (por serviço, hora ou visita) e itens incluídos.
- Receber solicitações na Agenda e confirmar ou recusar.
- Opção de atender somente mulheres.

**Ciclo de uma solicitação**

```
aguardando_prestador ──► confirmado ──► concluido
        │                   │
        ├──► recusado       └──► cancelado
        └──► cancelado
```

O prestador confirma ou recusa. O cliente pode cancelar antes da conclusão e marca como concluído, o que libera o pagamento.

## Tecnologias

| Camada            | Ferramentas                                                    |
| ----------------- | -------------------------------------------------------------- |
| Interface         | React 19, Vite, Tailwind CSS 4, lucide-react                   |
| Rotas             | React Router (carregamento de cada tela sob demanda)           |
| Formulários       | React Hook Form + Zod                                          |
| Dados e cache     | TanStack Query                                                 |
| Testes            | Vitest (unitários), Playwright + axe-core (ponta a ponta e acessibilidade) |
| Qualidade         | ESLint, Prettier                                               |
| Hospedagem        | Vercel                                                         |

## Como rodar

Requer **Node.js 20 ou superior**.

```bash
git clone https://github.com/AlexandreGarciaJr/app-maonamassa-senac-PI-2sem-2026.git
cd app-maonamassa-senac-PI-2sem-2026
npm install
npm run dev
```

Abra http://localhost:5173. Sem nenhuma configuração, o app roda em modo demonstração.

| Script              | O que faz                                    |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                  |
| `npm run build`     | Gera a versão de produção em `dist/`         |
| `npm run preview`   | Serve localmente a versão de produção        |
| `npm test`          | Testes unitários (Vitest)                    |
| `npm run test:e2e`  | Testes de ponta a ponta (Playwright)         |
| `npm run test:all`  | Unitários e ponta a ponta em sequência       |
| `npm run lint`      | Análise estática (ESLint)                    |
| `npm run format`    | Formata o código (Prettier)                  |

## Contas de demonstração

| Perfil    | E-mail                     | Senha    |
| --------- | -------------------------- | -------- |
| Cliente   | cliente@maonamassa.dev     | 123456   |
| Prestador | prestador@maonamassa.dev   | 123456   |

Essas contas existem só nos dados simulados.

## Telas e rotas

| Rota                                  | Tela                                                   | Acesso          |
| ------------------------------------- | ------------------------------------------------------ | --------------- |
| `/`                                   | Início: busca, categorias e filtros                    | Público         |
| `/servicos`                           | Profissionais: lista com filtros e ordenação           | Público         |
| `/servicos/:id`                       | Detalhe do serviço                                     | Público         |
| `/servicos/:id/contratar`             | Contratação                                            | Logado          |
| `/contratacoes/:id/confirmacao`       | Confirmação da contratação                             | Logado          |
| `/agenda`                             | Agenda: solicitações e botão de segurança              | Público*        |
| `/perfil`                             | Perfil e preferências                                  | Público*        |
| `/login`, `/cadastro`                 | Login e cadastro (cliente ou prestador)                | Público         |
| `/prestador/servicos/novo`            | Cadastro de serviço                                    | Prestador       |

\* Sem login, a tela convida o usuário a entrar ou criar uma conta.

## Estrutura de pastas

```
src/
├── app/          # App e definição das rotas
├── features/     # módulos por funcionalidade
│   ├── auth/     #   login, cadastro, sessão e rotas protegidas
│   ├── services/ #   início, lista, detalhe e cadastro de serviço
│   ├── hiring/   #   contratação, confirmação e agenda
│   └── profile/  #   perfil e preferências
├── components/   # layout e componentes visuais reutilizáveis
├── constants/    # categorias e rotas
├── config/       # leitura das variáveis de ambiente
├── hooks/        # hooks genéricos
├── lib/          # cliente HTTP, máscaras, validações e formatação
├── mocks/        # dados simulados (saem com o backend)
├── pages/        # página não encontrada e página de erro
├── styles/       # CSS global (Tailwind)
└── test/         # testes unitários e configuração
docs/API.md       # contrato entre frontend e backend
e2e/              # testes de ponta a ponta (Playwright)
qa/               # plano de testes, bugs, evidências e relatórios
```

Cada funcionalidade tem uma pasta `api/` com as chamadas ao servidor. Em modo demonstração essas funções respondem com os dados de `src/mocks/`, seguindo o mesmo formato da API real.

## Integração com o backend

1. Copie `.env.example` para `.env.local`.
2. Ajuste as variáveis:

```env
VITE_API_URL=https://endereco-da-api/api
VITE_USE_MOCKS=false
```

3. Rode `npm run test:all` de novo para conferir os fluxos com a API real.

O contrato completo (endpoints, formatos, status e regras de permissão) está em [`docs/API.md`](docs/API.md). Pontos que o backend precisa garantir:

- Rotas autenticadas recebem `Authorization: Bearer <token>`. Uma resposta `401` encerra a sessão no app.
- Erros respondem com o status HTTP adequado e corpo `{ "message": "texto para o usuário" }`.
- Só o cliente dono e o prestador do serviço podem ver uma solicitação (ver [BUG-001](qa/bugs/BUG-001.md)).
- E-mail e CPF devem ser únicos no cadastro.
- A distância (`distanceKm`) é calculada pelo backend a partir da localização do usuário.

## Testes e qualidade

```bash
npm test           # 39 testes unitários (Vitest)
npm run test:e2e   # 15 testes de ponta a ponta (Playwright, usa o Microsoft Edge instalado)
npm run lint
```

Resultado do QA do frontend (16/11/2026):

- **10 de 10** fluxos críticos passando. A suíte E2E rodou 3 vezes seguidas sem nenhum teste instável.
- **8 bugs** encontrados (1 alto, 4 médios, 3 baixos): 7 corrigidos com teste de regressão e 1 corrigido em parte.
- **Performance:** LCP de até 1,6 s e CLS 0 em todas as telas (medido em laboratório).
- **Segurança:** sem XSS, sem segredos no build e 0 vulnerabilidades nas dependências.
- **Acessibilidade:** texto sobre fundo claro dentro do contraste mínimo. Ressalva: texto branco sobre o coral `#E85D5D` fica em 3,4:1, mantido para preservar a identidade visual.

Ressalvas em aberto: testar no Safari/iOS, configurar cabeçalhos de segurança no deploy e, na integração real, guardar o token em cookie `HttpOnly` em vez de `localStorage`.

## Publicação

Importe o repositório na [Vercel](https://vercel.com) com o preset **Vite**. O `vercel.json` já redireciona todas as rotas para o `index.html`, então os links diretos (por exemplo `/servicos/s3`) funcionam. Configure `VITE_API_URL` e `VITE_USE_MOCKS` nas variáveis de ambiente do projeto quando o backend estiver no ar.

Depois de publicar, siga o roteiro de *smoke* do [relatório de QA](qa/RELATORIO-QA.md#smoke-pós-deploy-quando-publicar).

## Documentação complementar

| Documento                                                              | Conteúdo                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| [`docs/API.md`](docs/API.md)                                           | Contrato da API                                |
| [`qa/RELATORIO-QA.md`](qa/RELATORIO-QA.md)                             | Relatório de QA e decisão de entrega           |
| [`qa/PLANO-DE-TESTES.md`](qa/PLANO-DE-TESTES.md)                       | Plano de testes                                |
| [`qa/RELATORIO-NAO-FUNCIONAL.md`](qa/RELATORIO-NAO-FUNCIONAL.md)       | Acessibilidade, performance e segurança        |
| [`qa/bugs/`](qa/bugs/)                                                 | Bugs encontrados (BUG-001 a BUG-008)           |
| [`qa/varredura/`](qa/varredura/)                                       | Varredura automática com prints                |

## Conclusão

O Maonamassa nasceu de um problema concreto: a falta de segurança e de confiança na contratação de prestadores de serviço autônomos, sentida principalmente por mulheres que recebem desconhecidos em casa. Para responder a isso, o grupo propôs uma aplicação que vai além de juntar oferta e procura. Ela traz mecanismos de proteção ao longo de todo o atendimento: verificação de identidade dos prestadores, preferência de gênero tanto para clientes quanto para prestadoras, um botão de segurança que aciona um contato de emergência durante a visita e um pagamento que só é liberado depois que o cliente confirma a conclusão do serviço.

### Entregas

O objetivo de construir uma solução funcional que mostrasse essa proposta foi alcançado na camada de interface. O frontend está publicado e cobre todo o percurso do usuário: busca, comparação de profissionais, contratação, acompanhamento na agenda e gestão do perfil, para clientes e para prestadores. O trabalho também foi validado por um processo de qualidade estruturado. Foram 39 testes unitários e 15 testes de ponta a ponta, todos os dez fluxos críticos aprovados e oito defeitos encontrados, dos quais sete foram corrigidos. A verificação incluiu ainda critérios de acessibilidade, desempenho e segurança.

### Dificuldades

A principal dificuldade foi coordenar frentes que dependem umas das outras: protótipo, banco de dados, backend e interface. A saída foi definir cedo um contrato de API documentado e criar dados simulados que seguem esse contrato. Assim, a interface pôde ser desenvolvida e testada sem esperar o servidor, e a integração futura se resume a trocar uma configuração. Essa decisão mostrou na prática a importância de separar responsabilidades e de documentar as interfaces entre as partes de um sistema.

### Próximos passos

- Concluir o backend e o banco de dados e integrá-los à aplicação.
- Implementar o processamento real de pagamentos e o envio efetivo de alertas pelo botão de segurança.
- Testar a aplicação no Safari/iOS.
- Reforçar a segurança da publicação com cabeçalhos HTTP e o armazenamento da sessão em cookies protegidos.

Além do produto, o projeto permitiu ao grupo aplicar de forma integrada os conteúdos do semestre, como modelagem de dados, desenvolvimento web, testes de software e trabalho em equipe, aproximando a formação acadêmica das práticas do mercado.
