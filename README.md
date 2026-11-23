# Maonamassa

> Encontre prestadores de serviço verificados perto de você, com segurança.

**Demonstração:** https://app-maonamassa.vercel.app

O Maonamassa é um aplicativo web mobile-first que conecta clientes a prestadores de serviço autônomos (elétrica, hidráulica, pintura, alvenaria, manutenção, montagem, limpeza e jardinagem). O foco é a **segurança** de quem contrata e de quem presta o serviço:

- **Perfis verificados:** o prestador envia um documento no cadastro e recebe o selo de verificado.
- **Preferência de gênero:** a cliente pode dar preferência a prestadoras, e a prestadora pode escolher atender preferencialmente mulheres.
- **Botão de segurança:** durante a visita, avisa um contato de emergência e compartilha os dados do atendimento.
- **Pagamento retido:** o valor só é liberado ao prestador depois que o cliente confirma a conclusão do serviço.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Modo demonstração](#modo-demonstração)
- [Telas e rotas](#telas-e-rotas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Conexão com o Supabase](#conexão-com-o-supabase)
- [Testes e qualidade](#testes-e-qualidade)
- [Publicação](#publicação)
- [Documentação complementar](#documentação-complementar)
- [Conclusão](#conclusão)

---

## Funcionalidades

**Cliente**
- Buscar serviços por texto e categoria, com filtros (só verificados, só prestadoras) e ordenação por avaliação, distância ou preço.
- Ver os detalhes do serviço: o que está incluído, preço, avaliações e perfil do prestador.
- Contratar: data e período, endereço com CEP, detalhes, forma de pagamento (Pix ou cartão) e contato de emergência opcional.
- Acompanhar as solicitações na Agenda, cancelar, confirmar a conclusão e usar o botão de segurança.
- Avaliar o atendimento concluído, de 1 a 5 estrelas, com comentário.
- Ajustar perfil e preferências (preferência por prestadoras).

**Prestador**
- Cadastro com CEP, bairro, bio e envio de documento (JPG, PNG ou PDF até 5 MB) para a verificação de identidade.
- Cadastrar e editar serviços com área, tipo, título, descrição, valor e itens incluídos.
- Ativar ou desativar cada serviço em "Meus serviços" (serviço inativo não aparece nas buscas).
- Receber solicitações na Agenda e confirmar ou recusar.
- Avaliar o cliente depois do atendimento concluído.
- Opção de atender preferencialmente mulheres.

**Ciclo de uma solicitação**

```
aguardando_prestador ──► confirmado ──► concluido
        │                   │
        ├──► recusado       └──► cancelado
        └──► cancelado
```

O prestador confirma ou recusa. O cliente pode cancelar antes da conclusão e marca como concluído, o que libera o pagamento. Depois da conclusão, cliente e prestador podem se avaliar, e a nota média do prestador é atualizada.

## Tecnologias

| Camada            | Ferramentas                                                    |
| ----------------- | -------------------------------------------------------------- |
| Interface         | React 19, Vite, Tailwind CSS 4, lucide-react                   |
| Rotas             | React Router (carregamento de cada tela sob demanda)           |
| Formulários       | React Hook Form + Zod                                          |
| Dados e cache     | TanStack Query                                                 |
| Testes            | Vitest (unitários), Playwright + axe-core (ponta a ponta e acessibilidade) |
| Qualidade         | ESLint, Prettier                                               |
| Backend           | Supabase (PostgreSQL, Auth e Storage)                          |
| Hospedagem        | Vercel                                                         |

## Como rodar

Requer **Node.js 20 ou superior**.

```bash
git clone https://github.com/AlexandreGarciaJr/app-maonamassa-senac-PI-2sem-2026.git
cd app-maonamassa-senac-PI-2sem-2026
npm install
npm run dev
```

Abra http://localhost:5173.

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

## Modo demonstração

Sem nenhuma configuração, o app usa dados simulados (`src/mocks/`), no mesmo formato dos dados do banco. Esses dados servem só para visualização. Com o Supabase conectado (`VITE_USE_MOCKS=false`), tudo passa a vir do uso real: cadastros, serviços publicados, contratações e avaliações. Nesta versão a contratação é demonstrativa e nenhum pagamento é processado.

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
| `/agenda`                             | Agenda: solicitações, avaliações e botão de segurança  | Público*        |
| `/perfil`                             | Perfil, preferências e meus serviços (prestador)       | Público*        |
| `/login`, `/cadastro`                 | Login e cadastro (cliente ou prestador)                | Público         |
| `/prestador/servicos/novo`            | Cadastro de serviço                                    | Prestador       |
| `/prestador/servicos/:id/editar`      | Edição de serviço                                      | Prestador       |

\* Sem login, a tela convida o usuário a entrar ou criar uma conta.

## Estrutura de pastas

```
src/
├── app/          # App e definição das rotas
├── features/     # módulos por funcionalidade
│   ├── auth/     #   login, cadastro, sessão e rotas protegidas
│   ├── services/ #   início, lista, detalhe, cadastro e edição de serviço
│   ├── hiring/   #   contratação, confirmação e agenda
│   ├── reviews/  #   avaliação de atendimentos
│   └── profile/  #   perfil, preferências e meus serviços
├── components/   # layout e componentes visuais reutilizáveis
├── constants/    # categorias e rotas
├── config/       # leitura das variáveis de ambiente
├── hooks/        # hooks genéricos
├── lib/          # cliente do Supabase, máscaras, validações e formatação
├── mocks/        # dados simulados do modo demonstração
├── pages/        # página não encontrada e página de erro
├── styles/       # CSS global (Tailwind)
└── test/         # testes unitários e configuração
docs/API.md       # contrato do backend (Supabase)
supabase/         # migrations do banco (tabelas, regras de acesso e funções)
e2e/              # testes de ponta a ponta (Playwright)
qa/               # plano de testes, bugs, evidências e relatórios
```

Cada funcionalidade tem uma pasta `api/` com as chamadas ao Supabase. No modo demonstração essas funções respondem com os dados de `src/mocks/`, no mesmo formato.

## Conexão com o Supabase

O backend é o [Supabase](https://supabase.com): banco PostgreSQL, login (Supabase Auth) e arquivos (Supabase Storage). O app conversa direto com ele, sem servidor intermediário.

1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis (em **Project Settings > API Keys** no painel do Supabase):

```env
VITE_USE_MOCKS=false
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

A chave publicável pode ficar no app, porque quem protege os dados são as regras de acesso do banco. A chave secreta (`sb_secret_...`) nunca vai para o app nem para o repositório.

O banco é criado pelos scripts de [`supabase/migrations`](supabase/README.md), que rodam em ordem. O diagrama está em [`diagrama_db_maonamassa.png`](diagrama_db_maonamassa.png). Principais regras garantidas pelo próprio banco:

- Cada pessoa só vê e altera o que é dela ou os atendimentos de que participa (Row Level Security).
- Só o prestador confirma ou recusa um atendimento; só o cliente cancela ou conclui.
- E-mail e CPF são únicos no cadastro.
- A nota média e o número de serviços concluídos do prestador são atualizados sozinhos a cada avaliação e conclusão.
- Os documentos dos prestadores ficam numa pasta privada, e cada um só envia e lê os seus.

Para a demonstração, desligue **Confirm email** em **Authentication > Sign In / Providers > Email**, para a conta funcionar logo após o cadastro. A verificação de identidade é manual: no **Table Editor**, mude `status_verificacao` do usuário para `verificado`.

Detalhes em [`supabase/README.md`](supabase/README.md) e [`docs/API.md`](docs/API.md).

## Testes e qualidade

```bash
npm test           # 39 testes unitários (Vitest)
npm run test:e2e   # 15 testes de ponta a ponta (Playwright, usa o Microsoft Edge instalado)
npm run lint
```

Resultados:

- **10 de 10** fluxos críticos passando. A suíte E2E rodou 3 vezes seguidas sem nenhum teste instável.
- **8 bugs** encontrados (1 alto, 4 médios, 3 baixos): 7 corrigidos com teste de regressão e 1 corrigido em parte.
- **Performance:** LCP de até 1,6 s e CLS 0 em todas as telas (medido em laboratório).
- **Segurança:** sem XSS, sem segredos no build e 0 vulnerabilidades nas dependências.
- **Acessibilidade:** texto sobre fundo claro dentro do contraste mínimo. Ressalva: texto branco sobre o coral `#E85D5D` fica em 3,4:1, mantido para preservar a identidade visual.

Pontos em aberto: configurar cabeçalhos de segurança no deploy e guardar a sessão em cookie `HttpOnly` em vez de `localStorage`.

## Publicação

Importe o repositório na [Vercel](https://vercel.com) com o preset **Vite**. O `vercel.json` já redireciona todas as rotas para o `index.html`, então os links diretos (por exemplo `/servicos/s3`) funcionam. Para usar o Supabase, cadastre `VITE_USE_MOCKS`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em **Settings > Environment Variables** do projeto na Vercel.

Depois de publicar, siga o roteiro de *smoke* do [relatório de QA](qa/RELATORIO-QA.md#smoke-pós-deploy-quando-publicar).

## Documentação complementar

| Documento                                                              | Conteúdo                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| [`docs/API.md`](docs/API.md)                                           | Contrato do backend (Supabase)                 |
| [`supabase/README.md`](supabase/README.md)                             | Banco, regras de acesso e migrations           |
| [`qa/RELATORIO-QA.md`](qa/RELATORIO-QA.md)                             | Relatório de QA                                |
| [`qa/PLANO-DE-TESTES.md`](qa/PLANO-DE-TESTES.md)                       | Plano de testes                                |
| [`qa/RELATORIO-NAO-FUNCIONAL.md`](qa/RELATORIO-NAO-FUNCIONAL.md)       | Acessibilidade, performance e segurança        |
| [`qa/bugs/`](qa/bugs/)                                                 | Bugs encontrados (BUG-001 a BUG-008)           |
| [`qa/varredura/`](qa/varredura/)                                       | Varredura automática com prints                |

## Conclusão

O Maonamassa responde a um problema concreto: a falta de segurança e de confiança na contratação de prestadores de serviço autônomos, sentida principalmente por mulheres que recebem desconhecidos em casa. Por isso a aplicação vai além de juntar oferta e procura. Ela traz proteção ao longo de todo o atendimento: verificação de identidade dos prestadores, preferência de gênero para clientes e prestadoras, botão de segurança que aciona um contato de emergência durante a visita e pagamento liberado só depois que o cliente confirma a conclusão do serviço.

### Entregas

A aplicação está publicada e cobre todo o percurso do usuário: busca, comparação de profissionais, contratação, acompanhamento na agenda e gestão do perfil, para clientes e para prestadores. A qualidade foi verificada com 39 testes unitários e 15 testes de ponta a ponta. Os dez fluxos críticos foram aprovados e, dos oito defeitos encontrados, sete foram corrigidos. A verificação incluiu ainda acessibilidade, desempenho e segurança. A aplicação também está integrada ao Supabase, que cuida do banco de dados, do login e das regras de acesso, e foi testada no Safari, sem problemas encontrados.

### Dificuldades

O principal desafio técnico foi desenvolver e testar a interface antes de o banco de dados existir. A solução foi definir um contrato documentado e um modo demonstração com dados simulados no mesmo formato. Com isso, as telas foram construídas e testadas de ponta a ponta em paralelo ao backend, e a integração com o Supabase aconteceu sem refazer as telas: cada módulo tem uma versão real e uma de demonstração, escolhidas por configuração.

### Próximos passos

Para evoluir o Maonamassa de projeto acadêmico para produto:

- Integrar um meio de pagamento real e o envio efetivo de alertas pelo botão de segurança.
- Reforçar a segurança da publicação, com cabeçalhos HTTP e a sessão em cookies protegidos.
