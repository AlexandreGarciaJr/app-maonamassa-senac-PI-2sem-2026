# Contrato da API (frontend ↔ backend)

O frontend já chama estes endpoints. Enquanto o backend não existe, as respostas vêm de
`src/mocks/handlers.js`, que segue exatamente este contrato. Quando o backend estiver no ar:

1. Defina `VITE_API_URL` com a URL base (ex.: `https://api.maonamassa.com.br/api`).
2. Defina `VITE_USE_MOCKS=false`.

Todas as rotas autenticadas recebem `Authorization: Bearer <token>`.
Erros devem responder com status HTTP adequado e corpo `{ "message": "texto para o usuário" }`.
Um `401` encerra a sessão no frontend.

## Autenticação

### `POST /auth/login`

```json
{ "email": "cliente@maonamassa.dev", "password": "123456" }
```

Resposta `200`:

```json
{
  "token": "jwt...",
  "user": {
    "id": "u1",
    "role": "cliente",
    "name": "Mariana Oliveira",
    "email": "cliente@maonamassa.dev",
    "phone": "(11) 98765-4321",
    "gender": "feminino",
    "preferWomen": true
  }
}
```

`role`: `cliente` | `prestador`. `gender`: `feminino` | `masculino` | `outro` | `nao_informado`.

### `POST /auth/register` (multipart/form-data)

Campos comuns: `role`, `name`, `email`, `cpf`, `phone`, `gender`, `password`.

- Cliente: `preferWomen` (boolean).
- Prestador: `specialties[]` (slugs de categoria), `experience`, `serviceRadiusKm`, `cep`,
  `neighborhood`, `bio`, `womenOnly` (boolean), `document` (arquivo JPG/PNG/PDF até 5 MB).

Resposta `201`: mesmo formato do login. `400` se o e-mail ou CPF já existir.

## Serviços

Slugs de categoria: `eletrica`, `hidraulica`, `pintura`, `alvenaria`, `manutencao`, `montagem`,
`limpeza`, `jardinagem` (ver `src/constants/categories.js`).

### `GET /services?search=&category=&womenOnly=&limit=`

Resposta `200`: lista de `Service`, ordenada por relevância/avaliação.

```json
[
  {
    "id": "s3",
    "providerId": "p2",
    "category": "hidraulica",
    "type": "Conserto de vazamento",
    "title": "Conserto de vazamentos em geral",
    "description": "...",
    "includes": ["Localização do vazamento", "Garantia de 30 dias"],
    "price": 150,
    "priceUnit": "servico",
    "createdAt": "2026-10-01",
    "reviewsCount": 2,
    "provider": {
      "id": "p2",
      "name": "Joana Pereira",
      "gender": "feminino",
      "specialties": ["hidraulica"],
      "verified": true,
      "rating": 4.9,
      "jobsDone": 87,
      "neighborhood": "Campo Belo",
      "city": "São Paulo",
      "distanceKm": 2.8,
      "memberSince": "2024-06-02",
      "bio": "..."
    }
  }
]
```

`priceUnit`: `servico` | `hora` | `visita`. `distanceKm` é calculado pelo backend a partir da
localização do usuário.

### `GET /services/:id`

Igual a um item da lista, mais `reviews`:

```json
{ "...": "...", "reviews": [{ "id": "r4", "authorName": "Beatriz C.", "rating": 5, "comment": "...", "date": "2026-10-30" }] }
```

`404` se não existir.

### `POST /services` (prestador)

```json
{
  "category": "montagem",
  "type": "Montagem de móveis",
  "title": "Montagem de guarda-roupas",
  "description": "...",
  "price": 180,
  "priceUnit": "servico",
  "includes": ["Montagem completa"]
}
```

Resposta `201`: o `Service` criado. O prestador é identificado pelo token.

## Contratação

### `POST /hire-requests` (cliente)

```json
{
  "serviceId": "s3",
  "estimatedPrice": 150,
  "date": "2026-11-20",
  "period": "tarde",
  "cep": "04696-000",
  "street": "Av. Exemplo",
  "number": "100",
  "complement": "",
  "neighborhood": "Santo Amaro",
  "details": "A torneira da cozinha está pingando.",
  "paymentMethod": "pix",
  "emergencyName": "",
  "emergencyPhone": ""
}
```

`period`: `manha` | `tarde` | `noite`. `paymentMethod`: `pix` | `cartao`.

Resposta `201`: `{ "id": "OS-123456", "status": "aguardando_prestador", "createdAt": "...", ...campos enviados }`.

> Nesta fase do projeto a contratação é demonstrativa: nenhum pagamento é processado.

### `GET /hire-requests/:id`

A solicitação com o `service` (e seu `provider`) incluído. Só o cliente dono e o prestador do
serviço podem consultar.

### `GET /hire-requests` (Agenda)

Lista as solicitações do usuário logado, ordenadas por `date`, cada uma com `service` e
`provider` incluídos e com `clientName`.

- Cliente: as solicitações que ele fez.
- Prestador: as solicitações recebidas nos serviços dele.

### `PATCH /hire-requests/:id`

```json
{ "status": "confirmado" }
```

Status possíveis: `aguardando_prestador` (inicial), `confirmado`, `recusado`, `cancelado`,
`concluido`. O backend deve validar quem pode fazer cada mudança:

| Novo status  | Quem pode  | A partir de                         |
| ------------ | ---------- | ----------------------------------- |
| `confirmado` | prestador  | `aguardando_prestador`              |
| `recusado`   | prestador  | `aguardando_prestador`              |
| `cancelado`  | cliente    | `aguardando_prestador`, `confirmado` |
| `concluido`  | cliente    | `confirmado` (libera o pagamento)   |

Resposta `200`: a solicitação atualizada. `400` se a mudança não for permitida.

## Usuário

### `PATCH /users/me` (Perfil)

Atualiza dados e preferências do usuário logado. Campos aceitos: `name`, `phone`,
`preferWomen` (cliente) e `womenOnly` (prestadora).

```json
{ "preferWomen": true }
```

Resposta `200`: o `user` atualizado (mesmo formato do login).

## Filtros extras de `GET /services`

Além de `search`, `category`, `womenOnly` e `limit`, a tela Profissionais e o Perfil enviam:

- `verifiedOnly=true`: só prestadores com identidade verificada.
- `providerId=<id>`: serviços de um prestador ("Meus serviços").
- `sort=rating|distance|price`: melhor avaliados (padrão), mais próximos ou menor preço.
