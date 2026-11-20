alter table public.prestador add column servicos_concluidos integer not null default 0;

create or replace function privado.criar_perfil_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_papel text := coalesce(m->>'papel', 'cliente');
begin
  insert into public.usuario (id, nome, cpf, email, telefone, genero)
  values (
    new.id,
    coalesce(m->>'nome', split_part(new.email, '@', 1)),
    coalesce(m->>'cpf', new.id::text),
    new.email,
    m->>'telefone',
    coalesce(m->>'genero', 'nao_informado')
  );

  if v_papel = 'prestador' then
    insert into public.prestador (usuario_id, bio, raio_atendimento_km, atende_somente_mulheres)
    values (new.id, m->>'bio', nullif(m->>'raio_atendimento_km', '')::integer, coalesce((m->>'atende_somente_mulheres')::boolean, false));
  else
    insert into public.cliente (usuario_id, prefere_mulheres)
    values (new.id, coalesce((m->>'prefere_mulheres')::boolean, false));
  end if;
  return new;
end;
$$;

revoke all on function privado.criar_perfil_no_cadastro() from public, anon, authenticated;

create trigger trg_criar_perfil_no_cadastro
after insert on auth.users
for each row execute function privado.criar_perfil_no_cadastro();

create or replace function privado.contar_servico_concluido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'concluido' and old.status is distinct from 'concluido' then
    update public.prestador set servicos_concluidos = servicos_concluidos + 1 where usuario_id = new.prestador_id;
  end if;
  return new;
end;
$$;

revoke all on function privado.contar_servico_concluido() from public, anon, authenticated;

create trigger trg_atendimento_conta_concluido
after update on public.atendimento
for each row execute function privado.contar_servico_concluido();

create or replace function public.servicos_publicos()
returns table (
  id integer,
  prestador_id uuid,
  categoria varchar,
  tipo varchar,
  titulo varchar,
  descricao text,
  inclui text[],
  preco decimal,
  criado_em timestamptz,
  prestador_nome varchar,
  prestador_genero varchar,
  verificado boolean,
  nota_media decimal,
  total_avaliacoes integer,
  servicos_concluidos integer,
  bio text,
  membro_desde timestamptz,
  especialidades varchar[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ps.id,
    ps.prestador_id,
    c.slug,
    ps.tipo,
    ps.titulo,
    ps.descricao,
    ps.inclui,
    ps.preco,
    ps.criado_em,
    u.nome,
    u.genero,
    u.status_verificacao = 'verificado',
    p.nota_media,
    p.total_avaliacoes,
    p.servicos_concluidos,
    p.bio,
    u.criado_em,
    array(
      select distinct c2.slug
      from public.prestador_servico ps2
      join public.categoria_servico c2 on c2.id = ps2.categoria_id
      where ps2.prestador_id = ps.prestador_id and ps2.ativo
    )::varchar[]
  from public.prestador_servico ps
  join public.prestador p on p.usuario_id = ps.prestador_id
  join public.usuario u on u.id = ps.prestador_id
  join public.categoria_servico c on c.id = ps.categoria_id
  where ps.ativo;
$$;

create or replace function public.avaliacoes_do_prestador(p_prestador_id uuid)
returns table (id integer, autor_nome text, nota integer, comentario text, criado_em timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    av.id,
    split_part(u.nome, ' ', 1) || case when position(' ' in trim(u.nome)) > 0
      then ' ' || left(split_part(trim(u.nome), ' ', array_length(string_to_array(trim(u.nome), ' '), 1)), 1) || '.'
      else '' end,
    av.nota,
    av.comentario,
    av.criado_em
  from public.avaliacao av
  join public.atendimento a on a.id = av.atendimento_id
  join public.usuario u on u.id = av.avaliador_id
  where av.avaliado_id = p_prestador_id and a.prestador_id = p_prestador_id
  order by av.criado_em desc;
$$;

revoke execute on function public.servicos_publicos() from public;
revoke execute on function public.avaliacoes_do_prestador(uuid) from public;
grant execute on function public.servicos_publicos() to anon, authenticated;
grant execute on function public.avaliacoes_do_prestador(uuid) to anon, authenticated;
