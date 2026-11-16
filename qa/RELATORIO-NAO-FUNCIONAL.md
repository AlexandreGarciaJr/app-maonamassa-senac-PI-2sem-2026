# Relatório não funcional — 16/11/2026

Base: varredura automática (`qa/varredura/RELATORIO-VARREDURA.md`, 10 páginas × desktop e
celular), axe-core e checagem manual.

## Acessibilidade (WCAG 2.1 AA)

| Item | Resultado |
| ---- | --------- |
| Contraste do texto sobre fundo claro | ✅ corrigido (BUG-004): coral de texto `#B03A3A`, cinza `#6B6B7E`, nota `#9A5B00` |
| Contraste do texto branco sobre coral `#E85D5D` (botões, barra inferior, alternador) | ⚠️ 3,4:1 (rótulos inativos da barra: 2,2:1). **Ressalva**: mantido para preservar a identidade aprovada |
| Campos com rótulo, erros anunciados (`role="alert"`) | ✅ |
| Teclado: painel inferior prende e devolve o foco | ✅ corrigido (BUG-005) |
| `prefers-reduced-motion` desliga as animações | ✅ (revisão do CSS) |
| 320 px sem rolagem lateral | ✅ corrigido (BUG-002) |

Para resolver a ressalva sem trocar a identidade: usar o coral escuro `#C94848` (4,9:1) só no
fundo dos botões e manter `#E85D5D` nos cabeçalhos. **Decisão do grupo.**

## Performance (laboratório, sem limitar a rede)

LCP entre 0,5 s e 1,6 s; **CLS 0 em todas as telas** (era 0,112 no detalhe, BUG-007 corrigido).
Bundle principal ~132 KB gzip; cada tela é carregada sob demanda. Não medido com rede 3G.

## Segurança (frontend)

| Item | Resultado |
| ---- | --------- |
| Texto hostil (`<script>`, aspas, HTML) | ✅ exibido como texto, não executa |
| Segredos no build | ✅ nenhum (só a senha de demonstração `123456`, nos dados simulados) |
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades |
| Acesso a solicitação de outro usuário | ✅ bloqueado nos dados simulados (BUG-001) |
| Cabeçalhos de segurança no deploy (CSP, HSTS etc.) | ⚠️ não configurados. Recomendação para quando publicar na Vercel |
| Token salvo no `localStorage` | ⚠️ aceitável na demonstração; na integração real, preferir cookie `HttpOnly` |

## Compatibilidade

Testado no Microsoft Edge (Chromium) em 320, 390 e 1440 px. **Não testado:** Safari/iOS e
Firefox. Recomendado abrir num iPhone antes da apresentação.
