# Sessão exploratória — 16/11/2026

Ambiente: `localhost:5173`, Edge via Playwright (Pixel 7 e 320×640), dados simulados.
Evidências: `qa/sessoes/evidencias/`.

| Charter | Resultado | Bugs |
| ------- | --------- | ---- |
| **C1** Explorar a contratação **com** dados brasileiros e texto hostil (`<script>`, emoji, aspas, `s/n`, CEP longo, data passada, duplo clique) **para descobrir** falhas de validação e de segurança | Sólido. CEP corta dígitos extras, data passada é bloqueada, `<script>` aparece como texto (não executa), duplo clique cria uma única solicitação | — |
| **C2** Explorar o cadastro **com** CPF, telefone com +55, nome com apóstrofo e e-mail repetido com espaços **para descobrir** erros de máscara e duplicidade | E-mail repetido é recusado mesmo com espaços. Telefone com +55 vira DDD 55 | BUG-006, BUG-008 (CPF) |
| **C3** Explorar permissões e estado **com** logout + voltar, ID inexistente na URL e OS de outro usuário **para descobrir** acesso indevido | Voltar após sair mostra a tela deslogada (ok). Serviço inexistente mostra "não encontrado" (ok). Prestador via a OS de outra cliente | BUG-001 |
| **C4** Explorar o layout **com** 320 px e título longo sem espaços **para descobrir** estouro de tela | Rolagem lateral em Profissionais | BUG-002 |
| **C5** Explorar a navegação **com** falha de rede ao carregar uma tela **para descobrir** mensagens de erro enganosas | Mostrava "Página não encontrada" | BUG-003 |

## Dúvidas (comportamentos a definir pelo grupo)

- Duas solicitações iguais (mesmo serviço e data) devem ser permitidas?
- Antecedência mínima para contratar (hoje aceita a data de hoje, em qualquer período)?
- Política de cancelamento: a tela só avisa da taxa, não calcula.

## Ideias que viraram teste automatizado

BUG-001 (unitário), BUG-002, BUG-003 e BUG-005 (E2E em `e2e/regressao.spec.js`), BUG-006 e BUG-008 (unitários).

## Fora da sessão

Rede lenta real (3G), Safari/iOS e respostas de erro da API (não existe API ainda).
