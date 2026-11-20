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
    insert into public.prestador (usuario_id, bio, atende_somente_mulheres)
    values (new.id, m->>'bio', coalesce((m->>'atende_somente_mulheres')::boolean, false));
  else
    insert into public.cliente (usuario_id, prefere_mulheres)
    values (new.id, coalesce((m->>'prefere_mulheres')::boolean, false));
  end if;
  return new;
end;
$$;

alter table public.prestador drop column raio_atendimento_km;

grant update (categoria_id) on public.prestador_servico to authenticated;

drop function public.servicos_publicos();

create function public.servicos_publicos()
returns table (
  id integer,
  prestador_id uuid,
  categoria varchar,
  tipo varchar,
  titulo varchar,
  descricao text,
  inclui text[],
  preco decimal,
  ativo boolean,
  criado_em timestamptz,
  prestador_nome varchar,
  prestador_genero varchar,
  verificado boolean,
  nota_media decimal,
  total_avaliacoes integer,
  servicos_concluidos integer,
  bio text,
  membro_desde timestamptz
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
    ps.ativo,
    ps.criado_em,
    u.nome,
    u.genero,
    u.status_verificacao = 'verificado',
    p.nota_media,
    p.total_avaliacoes,
    p.servicos_concluidos,
    p.bio,
    u.criado_em
  from public.prestador_servico ps
  join public.prestador p on p.usuario_id = ps.prestador_id
  join public.usuario u on u.id = ps.prestador_id
  join public.categoria_servico c on c.id = ps.categoria_id
  -- Serviços inativos só aparecem para o próprio prestador.
  where ps.ativo or ps.prestador_id = auth.uid();
$$;

revoke execute on function public.servicos_publicos() from public;
grant execute on function public.servicos_publicos() to anon, authenticated;
