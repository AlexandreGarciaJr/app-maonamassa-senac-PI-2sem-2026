create table public.usuario (
  id integer generated always as identity primary key,
  nome varchar not null,
  cpf varchar not null unique,
  email varchar not null unique,
  telefone varchar,
  data_nascimento date,
  genero varchar,
  foto_url varchar,
  status_verificacao varchar not null default 'pendente',
  contato_emergencia1_nome varchar,
  contato_emergencia1_telefone varchar,
  contato_emergencia2_nome varchar,
  contato_emergencia2_telefone varchar,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.cliente (
  usuario_id integer primary key references public.usuario(id) on delete cascade,
  preferencia_genero varchar,
  nota_media decimal(3,2) not null default 0,
  total_avaliacoes integer not null default 0,
  atualizado_em timestamptz not null default now()
);

create table public.prestador (
  usuario_id integer primary key references public.usuario(id) on delete cascade,
  bio text,
  raio_atendimento_km integer,
  disponivel boolean not null default true,
  nota_media decimal(3,2) not null default 0,
  total_avaliacoes integer not null default 0,
  atualizado_em timestamptz not null default now()
);

create table public.categoria_servico (
  id integer generated always as identity primary key,
  nome varchar not null unique,
  descricao text
);

create table public.prestador_servico (
  id integer generated always as identity primary key,
  prestador_id integer not null references public.prestador(usuario_id),
  categoria_id integer not null references public.categoria_servico(id),
  valor_min decimal(10,2) not null,
  valor_max decimal(10,2) not null,
  unidade_cobranca varchar,
  ativo boolean not null default true,
  descricao varchar,
  atualizado_em timestamptz not null default now(),
  constraint prestador_servico_faixa_valor check (valor_min <= valor_max)
);

create table public.endereco (
  id integer generated always as identity primary key,
  cliente_id integer not null references public.cliente(usuario_id),
  apelido varchar,
  logradouro varchar not null,
  numero varchar,
  complemento varchar,
  bairro varchar,
  cidade varchar not null,
  uf char(2) not null,
  cep varchar,
  latitude decimal(9,6),
  longitude decimal(9,6),
  ativo boolean not null default true
);

create table public.atendimento (
  id integer generated always as identity primary key,
  cliente_id integer not null references public.cliente(usuario_id),
  prestador_id integer not null references public.prestador(usuario_id),
  prestador_servico_id integer not null references public.prestador_servico(id),
  endereco_id integer not null references public.endereco(id),
  status varchar not null default 'solicitado',
  valor_acordado decimal(10,2),
  valor_final decimal(10,2),
  agendado_para timestamptz,
  iniciado_em timestamptz,
  finalizado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint atendimento_status_valido check (status in ('solicitado','aceito','em_andamento','concluido','cancelado'))
);

create table public.avaliacao (
  id integer generated always as identity primary key,
  atendimento_id integer not null references public.atendimento(id),
  avaliador_id integer not null references public.usuario(id),
  avaliado_id integer not null references public.usuario(id),
  nota integer not null,
  comentario text,
  criado_em timestamptz not null default now(),
  constraint avaliacao_nota_valida check (nota between 1 and 5),
  constraint avaliacao_uma_por_avaliador unique (atendimento_id, avaliador_id)
);

create table public.verificacao (
  id integer generated always as identity primary key,
  usuario_id integer not null references public.usuario(id),
  tipo_documento varchar not null,
  documento_url varchar,
  selfie_url varchar,
  status varchar not null default 'pendente',
  verificado_em timestamptz
);

create table public.alerta_seguranca (
  id integer generated always as identity primary key,
  atendimento_id integer not null references public.atendimento(id),
  usuario_id integer not null references public.usuario(id),
  latitude decimal(9,6),
  longitude decimal(9,6),
  status varchar not null default 'aberto',
  acionado_em timestamptz not null default now()
);

create index on public.prestador_servico (prestador_id);
create index on public.prestador_servico (categoria_id);
create index on public.endereco (cliente_id);
create index on public.atendimento (cliente_id);
create index on public.atendimento (prestador_id);
create index on public.atendimento (prestador_servico_id);
create index on public.atendimento (endereco_id);
create index on public.avaliacao (avaliador_id);
create index on public.avaliacao (avaliado_id);
create index on public.verificacao (usuario_id);
create index on public.alerta_seguranca (atendimento_id);
create index on public.alerta_seguranca (usuario_id);

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_usuario_atualizado_em before update on public.usuario for each row execute function public.set_atualizado_em();
create trigger trg_cliente_atualizado_em before update on public.cliente for each row execute function public.set_atualizado_em();
create trigger trg_prestador_atualizado_em before update on public.prestador for each row execute function public.set_atualizado_em();
create trigger trg_prestador_servico_atualizado_em before update on public.prestador_servico for each row execute function public.set_atualizado_em();
create trigger trg_atendimento_atualizado_em before update on public.atendimento for each row execute function public.set_atualizado_em();

alter table public.usuario enable row level security;
alter table public.cliente enable row level security;
alter table public.prestador enable row level security;
alter table public.categoria_servico enable row level security;
alter table public.prestador_servico enable row level security;
alter table public.endereco enable row level security;
alter table public.atendimento enable row level security;
alter table public.avaliacao enable row level security;
alter table public.verificacao enable row level security;
alter table public.alerta_seguranca enable row level security;
