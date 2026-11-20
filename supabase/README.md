# Backend (Supabase)

O backend do Maonamassa é o Supabase: banco PostgreSQL, login (Supabase Auth) e arquivos
(Supabase Storage). O app conversa direto com ele, sem servidor intermediário. As regras de
negócio e de segurança ficam no próprio banco, nos arquivos desta pasta.

## O que está em `migrations/`

Os arquivos rodam em ordem (o nome começa pela data). Juntos eles criam:

| Parte                            | O que faz                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tabelas                          | `usuario`, `cliente`, `prestador`, `categoria_servico`, `prestador_servico`, `endereco`, `atendimento`, `avaliacao`, `verificacao`, `alerta_seguranca` |
| Categorias                       | As 8 áreas de serviço usadas pelo app (`eletrica`, `hidraulica`, ...)                                                                                  |
| Regras de acesso (RLS)           | Cada pessoa só vê e altera o que é dela ou os atendimentos de que participa                                                                            |
| Colunas protegidas               | Ninguém altera pelo app o próprio `status_verificacao`, a nota média ou o status de um alerta                                                          |
| Cadastro                         | Ao criar a conta, o banco cria a linha em `usuario` e em `cliente` ou `prestador`                                                                      |
| Status do atendimento            | Só o prestador confirma ou recusa; só o cliente cancela ou conclui                                                                                     |
| Nota média e serviços concluídos | Atualizados sozinhos a cada avaliação e a cada conclusão                                                                                               |
| Vitrine                          | Funções `servicos_publicos` e `avaliacoes_do_prestador`: mostram só dados públicos do prestador                                                        |
| Serviço ativo/inativo            | Serviço inativo some das buscas, mas continua visível e editável para o próprio prestador                                                              |
| Documentos                       | Pasta privada `documentos` (JPG, PNG ou PDF até 5 MB); cada um só envia e lê os seus                                                                   |

O segundo arquivo recria as tabelas com `uuid` (ligado ao login do Supabase); o histórico foi
mantido como aconteceu.

## Como o app se conecta

No `.env.local` da raiz do projeto:

```bash
VITE_USE_MOCKS=false
VITE_SUPABASE_URL=https://rcwftcbaantadkhjexoc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

A chave publicável pode ficar no app. A chave secreta (`sb_secret_...`) nunca vai para o app
nem para o repositório.

## Para a demonstração

- Em **Authentication > Sign In / Providers > Email**, desligue **Confirm email** para que a
  conta funcione logo após o cadastro, sem precisar abrir o e-mail.
- Para marcar um prestador como verificado, no **Table Editor** abra a tabela `usuario` e mude
  `status_verificacao` para `verificado`. O documento enviado fica em **Storage > documentos**.
