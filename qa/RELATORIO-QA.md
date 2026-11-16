# Relatório de QA — Maonamassa (frontend) — 16/11/2026

## Decisão recomendada: GO com ressalvas

Todos os fluxos críticos passam, nenhum bug bloqueador, crítico ou alto ficou aberto. As ressalvas
são de identidade visual (contraste dos botões coral) e itens que só podem ser conferidos depois
(Safari/iOS e publicação).

## Resumo

- **Escopo:** todas as telas do frontend com dados simulados. Fora: backend, pagamento real,
  Safari/iOS, Firefox.
- **Fluxos críticos:** 10/10 passando.
- **Testes automatizados:** 39 unitários (Vitest) + 15 E2E (Playwright, celular). Suíte E2E
  rodada 3 vezes seguidas: **0 instáveis**.
- **Bugs:** 8 encontrados (1 alto, 4 médios, 3 baixos). **7 corrigidos** com teste de regressão;
  o BUG-008 foi corrigido em parte (CPF único) e os cabeçalhos de segurança do deploy ficaram como
  recomendação. Detalhes em `qa/bugs/`.
- **Acessibilidade:** texto sobre fundo claro OK; texto branco sobre coral abaixo de 4,5:1 (ressalva).
- **Performance:** LCP ≤ 1,6 s e CLS 0 em laboratório.
- **Segurança (frontend):** sem XSS, sem segredos, 0 vulnerabilidades nas dependências.

## Ressalvas e riscos conhecidos

| Risco | Probabilidade | Plano |
| ----- | ------------- | ----- |
| Botões e barra coral com contraste 3,4:1 (texto branco) | certa | Grupo decide: manter a identidade ou usar `#C94848` no fundo dos botões |
| Layout no Safari/iOS diferente do Edge | média | Abrir o app num iPhone antes da apresentação |
| Dados simulados ≠ API real | certa | Rodar `npm run test:all` de novo quando houver backend (`VITE_USE_MOCKS=false`) |
| Cabeçalhos de segurança ausentes no deploy | certa | Configurar ao publicar e conferir na URL de produção |

Observação: na primeira rodada após reformatar os arquivos, um teste falhou uma vez porque o
servidor de desenvolvimento recarregou a página no meio do teste. Não reproduziu em 10 repetições
nem nas 3 rodadas de confirmação.

## Como rodar os testes

```bash
npm test            # unitários
npm run test:e2e    # E2E (usa o Microsoft Edge instalado)
```

## Evidências

- Plano: `qa/PLANO-DE-TESTES.md`
- Bugs: `qa/bugs/BUG-001.md` a `BUG-008.md`
- Sessão exploratória: `qa/sessoes/2026-11-16-exploratorio.md` e `qa/sessoes/evidencias/`
- Varredura (axe, console, CLS, prints): `qa/varredura/RELATORIO-VARREDURA.md`
- Não funcional: `qa/RELATORIO-NAO-FUNCIONAL.md`
- Relatório HTML do Playwright: `qa/playwright-report/index.html` (gerado ao rodar os testes)

## Smoke pós-deploy (quando publicar)

1. Home, Profissionais e um detalhe abrem sem erro no console.
2. Login e logout com as duas contas de demonstração.
3. Contratação de ponta a ponta até a confirmação.
4. HTTPS válido e cabeçalhos de segurança presentes.
5. No celular: barra inferior e botão "Contratar Serviço" visíveis.
