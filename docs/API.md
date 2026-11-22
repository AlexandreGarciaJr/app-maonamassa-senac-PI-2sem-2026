# Contrato do backend (Supabase)

O Maonamassa não tem servidor próprio: o app conversa direto com o **Supabase** (banco
PostgreSQL, login e arquivos) pelo `@supabase/supabase-js`. As regras de negócio e de segurança
ficam no banco, em [`supabase/migrations`](../supabase/README.md). Este documento descreve o que
o front pede ao banco e o que o banco garante.

- O código que faz as chamadas está em `src/features/*/api/` (`authApi.js`, `servicesApi.js`,
  `hiringApi.js`) e em `src/lib/supabase.js`.
- Cada módulo tem uma versão **real** (Supabase) e uma de **demonstração** (`src/mocks`). Com
  `VITE_USE_MOCKS=true` (padrão) o app roda sem banco; com `VITE_USE_MOCKS=false` usa o Supabase.
- As telas recebem sempre o mesmo formato (`user`, `Service`, `HireRequest`), venha o dado do banco
  ou dos dados de exemplo.

## Tabelas

`usuario`, `cliente`, `prestador`, `categoria_servico`, `prestador_servico`, `endereco`,
`atendimento`, `avaliacao`, `verificacao`, `alerta_seguranca`. O diagrama está em
`diagrama_db_maonamassa.png`. O `id` de `usuario` é o `uuid` do login do Supabase (`auth.users`).

## Autenticação

### Cadastro (`auth.signUp`)

O app envia e-mail, senha e os dados do perfil em `options.data`:

| Campo enviado             | Quem usa  | Observação                                    |
| ------------------------- | --------- | --------------------------------------------- |
| `papel`                   | todos     | `cliente` (padrão) ou `prestador`             |
| `nome`, `cpf`, `telefone` | todos     |                                               |
| `genero`                  | todos     | `feminino`, `masculino`, `outro`, `nao_informado` |
| `prefere_mulheres`        | cliente   | booleano                                      |
| `bio`                     | prestador |                                               |
| `atende_somente_mulheres` | prestador | booleano                                      |

O próprio banco cria o perfil: o trigger `criar_perfil_no_cadastro` (em `auth.users`) insere a
linha em `usuario` e em `cliente` **ou** `prestador`, conforme o `papel`.

No formulário, as preferências `atende_somente_mulheres` (prestador) e `prefere_mulheres`
(cliente) ficam disponíveis quando o gênero informado é `feminino`.

- **E-mail repetido:** o Supabase recusa (o app mostra "Já existe uma conta com este e-mail.").
- **CPF repetido:** `usuario.cpf` é único; o banco recusa o cadastro e o app mostra "Já existe
  uma conta com este CPF".
- **Confirmação de e-mail:** com ela ligada, o cadastro não devolve sessão e o app avisa para
  confirmar pelo link. Para a demonstração, desligue em _Authentication > Sign In / Providers > Email_.
- **Documento do prestador:** enviado para o bucket privado `documentos`, no caminho
  `<id do usuário>/documento-<timestamp>.<ext>` (JPG, PNG ou PDF, até 5 MB), e registrado em
  `verificacao` (`tipo_documento = 'documento_com_foto'`). Se o envio falhar, a conta continua
  criada. Para o documento ser enviado já no cadastro, a confirmação de e-mail precisa estar
  desligada (configuração da demonstração).
- **Verificação de identidade:** hoje é manual. Na tabela `usuario`, mude `status_verificacao`
  de `pendente` para `verificado` (o app não consegue alterar essa coluna).

### Login e sessão

`auth.signInWithPassword`. Depois do login o app lê `usuario`, `cliente` e `prestador` para montar
o `user`. O papel é `prestador` quando existe linha em `prestador`; senão, `cliente`.

O app guarda `{ token, user }` no `localStorage` (chave `mnm:session`, com o `access_token` do
Supabase). Ao abrir o app, ele confere com `auth.getSession()`; se a sessão não vale mais, volta
para o modo visitante.

### Perfil

O usuário logado altera `usuario.nome`, `usuario.telefone`, `cliente.prefere_mulheres` e
`prestador.atende_somente_mulheres`. O contato de confiança fica em
`usuario.contato_emergencia1_nome` e `contato_emergencia1_telefone`.

## Serviços

### Vitrine: `rpc('servicos_publicos')`

Devolve os serviços junto com os dados **públicos** do prestador (nunca CPF ou telefone).

| Coluna                                                     | Conteúdo                                       |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `id`, `prestador_id`, `categoria` (slug), `tipo`, `titulo` | identificação                                  |
| `descricao`, `inclui` (lista), `preco`, `ativo`, `criado_em` | dados do serviço                             |
| `prestador_nome`, `prestador_genero`, `verificado`         | perfil público                                 |
| `nota_media`, `total_avaliacoes`, `servicos_concluidos`    | reputação (calculada pelo banco)               |
| `bio`, `membro_desde`                                      | apresentação                                   |

Serviço **inativo** só aparece para o próprio prestador ("Meus serviços"). Busca, categoria,
"só mulheres", "só verificados", ordenação e limite são aplicados no app
(`applyServiceFilters`), porque o volume é pequeno. Nesta versão o app é regional: não há
localização do prestador, então `distanceKm` é sempre vazio.

Categorias (`categoria_servico.slug`): `eletrica`, `hidraulica`, `pintura`, `alvenaria`,
`manutencao`, `montagem`, `limpeza`, `jardinagem`.

### Detalhe e avaliações: `rpc('avaliacoes_do_prestador', { p_prestador_id })`

Devolve as avaliações do prestador com o nome do autor abreviado (ex.: "Maria S.").

### Nome de outros usuários: `rpc('perfil_publico', { p_ids })`

Devolve `id`, `nome`, `foto_url`, `genero` e `status_verificacao` dos ids informados. A Agenda usa
para mostrar o nome do cliente (`clientName`) ao prestador. Só devolve dados de apresentação,
nunca CPF, e-mail ou telefone.

### Publicar e editar serviço

`insert`/`update` em `prestador_servico`. Campos do app → colunas: `category` → `categoria_id`
(buscado pelo slug), `type` → `tipo`, `title` → `titulo`, `description` → `descricao`,
`price` → `preco` (maior que zero), `includes` → `inclui`, `active` → `ativo`.
Só o dono do serviço consegue inserir ou alterar.

## Contratação (tabela `atendimento`)

### Criar solicitação

1. O app grava o endereço em `endereco` (`logradouro`, `numero`, `complemento`, `bairro`, `cep`).
2. Insere em `atendimento`: `cliente_id`, `prestador_id`, `prestador_servico_id`, `endereco_id`,
   `valor_acordado`, `agendado_para` e `forma_pagamento` (`pix` ou `cartao`).
3. Se o cliente informou contato de confiança, salva em `usuario`.

O banco só aceita o insert se o cliente for o próprio usuário logado, o endereço for dele e o
serviço estiver **ativo** e pertencer ao prestador informado.

- `valor_acordado` recebe o preço do serviço que a tela envia (`estimatedPrice`).
- O protocolo `OS-000123` é o `id` do atendimento com 6 dígitos.
- O período vira horário (fuso de São Paulo): manhã 08:00, tarde 12:00, noite 18:00.
- A contratação é demonstrativa: nenhum pagamento é processado.

### Consultar

`select` em `atendimento`: cada pessoa só recebe as linhas em que é o cliente ou o prestador.
Abrir a solicitação de outra pessoa não retorna nada, e o app mostra "Solicitação não
encontrada" (regra do BUG-001). O prestador também enxerga o endereço e o cadastro do cliente
**apenas** dos atendimentos que recebeu.

### Status

Valores: `aguardando_prestador` (inicial), `confirmado`, `recusado`, `cancelado`, `concluido`.
A mudança é validada pelo trigger `validar_mudanca_status`:

| Novo status  | Quem pode | A partir de                          |
| ------------ | --------- | ------------------------------------ |
| `confirmado` | prestador | `aguardando_prestador`               |
| `recusado`   | prestador | `aguardando_prestador`               |
| `cancelado`  | cliente   | `aguardando_prestador`, `confirmado` |
| `concluido`  | cliente   | `confirmado` (grava `finalizado_em`) |

Fora dessas regras o banco responde com erro `P0001` e uma mensagem em português; o app mostra o
texto e trata como `400`. Ao concluir, `prestador.servicos_concluidos` aumenta sozinho.

### Botão de segurança

`insert` em `alerta_seguranca` (`atendimento_id`, `usuario_id`). Só quem participa do
atendimento e só quando ele está `confirmado`. O `status` do alerta não pode ser alterado pelo app.

### Avaliações

`insert` em `avaliacao` (`atendimento_id`, `avaliador_id`, `avaliado_id`, `nota` de 1 a 5,
`comentario`). Só depois de `concluido`, só entre cliente e prestador daquele atendimento e uma
vez por avaliador. O trigger recalcula `nota_media` e `total_avaliacoes`. Ainda não há tela de
avaliação no app.

## Regras de acesso (RLS) por tabela

| Tabela              | Quem lê                                         | Quem escreve (e o quê)                                           |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `usuario`           | o próprio                                       | o próprio: nome, telefone, foto, contatos. Nunca `status_verificacao` |
| `cliente`           | o próprio e prestadores que o atenderam         | o próprio: `prefere_mulheres`. Nunca a nota                      |
| `prestador`         | usuários logados                                | o próprio: `bio`, `disponivel`, `atende_somente_mulheres`. Nunca nota, total ou concluídos |
| `categoria_servico` | todos, inclusive sem login                      | ninguém pelo app                                                 |
| `prestador_servico` | usuários logados (a vitrine esconde os inativos) | o dono                                                          |
| `endereco`          | o dono e o prestador do atendimento             | o dono (inserir e desativar)                                     |
| `atendimento`       | cliente e prestador do atendimento              | cliente cria; os dois atualizam, com o trigger de status         |
| `avaliacao`         | usuários logados                                | participante, após `concluido`                                   |
| `verificacao`       | o próprio                                       | o próprio (inserir)                                              |
| `alerta_seguranca`  | participantes do atendimento                    | participante, com atendimento `confirmado`                       |
| Storage `documentos`| o próprio (pasta com o seu id)                  | o próprio                                                        |

Funções auxiliares no schema `privado` evitam recursão entre policies e não ficam expostas ao app.
Os testes que conferem estas regras estão em
[`supabase/tests/rls_seguranca.sql`](../supabase/tests/rls_seguranca.sql).

## Erros mais comuns

O app traduz as mensagens do Supabase em `src/lib/supabase.js` (`toApiError`):

| Situação                         | Mensagem para o usuário                                  | Status |
| -------------------------------- | -------------------------------------------------------- | ------ |
| E-mail ou senha errados          | E-mail ou senha incorretos.                              | 401    |
| E-mail não confirmado            | Confirme seu e-mail pelo link que enviamos antes de entrar. | 401 |
| E-mail já cadastrado             | Já existe uma conta com este e-mail.                     | 400    |
| CPF já cadastrado                | Já existe uma conta com este CPF.                        | 400    |
| Muitas tentativas                | Muitas tentativas seguidas. Aguarde um minuto e tente de novo. | 429 |
| Sem internet                     | Não foi possível conectar ao servidor. Verifique sua internet. | 0 |
| Regra do banco (status etc.)     | a própria mensagem do banco, em português                | 400    |
| Sessão expirada                  | Sua sessão expirou. Entre novamente.                     | 401    |

## Escopo desta versão

- Contratação demonstrativa: a solicitação é registrada, mas nenhum pagamento é processado.
- App regional: não há cálculo de distância entre cliente e prestador.
- Verificação de identidade feita manualmente pela equipe (ver "Verificação de identidade").
- A avaliação do prestador já existe no banco (com cálculo automático da nota); a tela de
  avaliação no app é um próximo passo.
