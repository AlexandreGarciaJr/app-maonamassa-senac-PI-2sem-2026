# Plano de testes — Maonamassa (frontend)

Modo: **App** (perfis cliente/prestador, regras de status, dados pessoais).
Ambiente: `npm run dev` em `http://localhost:5173`, com dados simulados (`VITE_USE_MOCKS=true`).

## Escopo

**Dentro:** todas as telas do frontend (home, profissionais, detalhe, contratação, confirmação,
agenda, perfil, login, cadastro, cadastro de serviço), validações, permissões de rota, regras de
status da agenda, acessibilidade, layout mobile, segurança básica do frontend.

**Fora:** backend, banco, pagamento real, envio real de mensagens (botão de segurança é
demonstrativo), Safari/iOS real (não disponível neste ambiente).

## Mapa de riscos

| Área | Impacto | Prob. | Risco | Abordagem |
| ---- | :-----: | :---: | :---: | --------- |
| Contratação (formulário + envio) | 3 | 2 | 6 | unitário do schema + E2E + exploratório |
| Cadastro (CPF, senha, cliente/prestador) | 3 | 2 | 6 | unitário do schema + E2E + exploratório com dados BR |
| Agenda: mudanças de status e permissões | 3 | 2 | 6 | unitário das regras + E2E |
| Rotas protegidas (login/prestador) | 3 | 2 | 6 | E2E |
| Botão de segurança | 3 | 1 | 3 | E2E do fluxo feliz |
| Login | 2 | 1 | 2 | E2E |
| Busca e filtros (home e profissionais) | 2 | 2 | 4 | unitário do mock + E2E |
| Perfil (preferência) | 2 | 1 | 2 | E2E |
| Layout mobile / animações | 2 | 2 | 4 | revisão visual em 3 larguras |
| Acessibilidade | 2 | 2 | 4 | varredura automática + teclado |

## Camadas

| Camada | Ferramenta | O quê |
| ------ | ---------- | ----- |
| Estática | ESLint, build do Vite | todo o código |
| Unitário | Vitest | máscaras, CPF, schemas Zod, regras de status e filtros do mock |
| E2E | Playwright (Edge do sistema) | fluxos críticos abaixo, em viewport de celular |
| Visual | Playwright + prints | 320, 390 e 1280 px |
| Não funcional | axe-core no navegador, checagem manual | a11y, console, segurança básica |

## Fluxos críticos (E2E)

1. Visitante abre a home, filtra por categoria e vê os serviços certos.
2. Visitante tenta contratar → vai para o login → volta para a contratação após entrar.
3. Cliente preenche a contratação (com erros primeiro) e chega na confirmação.
4. Cadastro de cliente com CPF inválido é bloqueado; com dados válidos entra na home.
5. Cadastro de prestador exige especialidade e documento.
6. Cliente na Agenda: botão de segurança avisa o contato; confirmar conclusão move para o histórico.
7. Prestador na Agenda aceita uma solicitação recebida.
8. Cliente não acessa o cadastro de serviço (rota de prestador).
9. Profissionais: filtros na URL e ordenação por preço.
10. Perfil: ligar a preferência de gênero salva e liga o filtro da home.

## Dados

Contas de demonstração do seed (`src/mocks/data/users.js`): cliente e prestador. CPF de teste
válido `529.982.247-25`, CEP `04696-000`, nomes com acento. Cada teste E2E começa com o
`localStorage` limpo (dados isolados, sem depender da ordem).

## Critérios

**Entrada:** lint e build passam; home abre.
**Saída (GO):** 0 bugs bloqueadores/críticos; 10/10 fluxos críticos passando 3 vezes seguidas;
nenhuma violação de acessibilidade crítica ou séria nas telas principais; console sem erros.

## Riscos do próprio teste

- Sem backend: os testes validam o contrato simulado, não a API real. Precisam ser rodados de
  novo com `VITE_USE_MOCKS=false` quando o backend existir.
- Safari/iOS não testado (sem dispositivo). Recomendado testar num iPhone antes da apresentação.
- Desempenho medido só em ambiente de desenvolvimento.

## Perguntas em aberto para o grupo

- A contratação deve impedir duas solicitações iguais (mesmo serviço, mesma data)?
- Existe horário mínimo de antecedência para contratar (ex.: não permitir "hoje à noite")?
- Até quando o cliente pode cancelar sem taxa? (a tela só avisa, não calcula)
