create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated;

create or replace function privado.prestador_atende_endereco(p_endereco_id integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.atendimento a where a.endereco_id = p_endereco_id and a.prestador_id = auth.uid());
$$;

create or replace function privado.prestador_atende_cliente(p_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.atendimento a where a.cliente_id = p_cliente_id and a.prestador_id = auth.uid());
$$;

revoke all on function privado.prestador_atende_endereco(integer) from public;
revoke all on function privado.prestador_atende_cliente(uuid) from public;
grant execute on function privado.prestador_atende_endereco(integer) to authenticated;
grant execute on function privado.prestador_atende_cliente(uuid) to authenticated;

drop policy "endereco_select_proprio_ou_prestador_do_atendimento" on public.endereco;
create policy "endereco_select_proprio_ou_prestador_do_atendimento" on public.endereco for select to authenticated using (
  cliente_id = (select auth.uid()) or privado.prestador_atende_endereco(id)
);

drop policy "cliente_select_proprio_ou_prestador_do_atendimento" on public.cliente;
create policy "cliente_select_proprio_ou_prestador_do_atendimento" on public.cliente for select to authenticated using (
  usuario_id = (select auth.uid()) or privado.prestador_atende_cliente(usuario_id)
);
