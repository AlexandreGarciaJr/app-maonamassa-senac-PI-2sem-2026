revoke all on public.usuario, public.cliente, public.prestador, public.categoria_servico, public.prestador_servico, public.endereco, public.atendimento, public.avaliacao, public.verificacao, public.alerta_seguranca from anon, authenticated;

grant select on public.usuario, public.cliente, public.prestador, public.categoria_servico, public.prestador_servico, public.endereco, public.atendimento, public.avaliacao, public.verificacao, public.alerta_seguranca to authenticated;
grant select on public.categoria_servico to anon;

grant insert (id, nome, cpf, email, telefone, data_nascimento, genero, foto_url, contato_emergencia1_nome, contato_emergencia1_telefone, contato_emergencia2_nome, contato_emergencia2_telefone) on public.usuario to authenticated;
grant update (nome, telefone, data_nascimento, genero, foto_url, contato_emergencia1_nome, contato_emergencia1_telefone, contato_emergencia2_nome, contato_emergencia2_telefone) on public.usuario to authenticated;

create policy "usuario_select_proprio" on public.usuario for select to authenticated using (id = (select auth.uid()));
create policy "usuario_insert_proprio" on public.usuario for insert to authenticated with check (id = (select auth.uid()));
create policy "usuario_update_proprio" on public.usuario for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

grant insert (usuario_id, preferencia_genero) on public.cliente to authenticated;
grant update (preferencia_genero) on public.cliente to authenticated;

create policy "cliente_select_proprio_ou_prestador_do_atendimento" on public.cliente for select to authenticated using (
  usuario_id = (select auth.uid())
  or exists (select 1 from public.atendimento a where a.cliente_id = cliente.usuario_id and a.prestador_id = (select auth.uid()))
);
create policy "cliente_insert_proprio" on public.cliente for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "cliente_update_proprio" on public.cliente for update to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

grant insert (usuario_id, bio, raio_atendimento_km, disponivel) on public.prestador to authenticated;
grant update (bio, raio_atendimento_km, disponivel) on public.prestador to authenticated;

create policy "prestador_select_todos" on public.prestador for select to authenticated using (true);
create policy "prestador_insert_proprio" on public.prestador for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "prestador_update_proprio" on public.prestador for update to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

create policy "categoria_select_todos" on public.categoria_servico for select to anon, authenticated using (true);

grant insert (prestador_id, categoria_id, valor_min, valor_max, unidade_cobranca, ativo, descricao) on public.prestador_servico to authenticated;
grant update (valor_min, valor_max, unidade_cobranca, ativo, descricao) on public.prestador_servico to authenticated;

create policy "prestador_servico_select_todos" on public.prestador_servico for select to authenticated using (true);
create policy "prestador_servico_insert_proprio" on public.prestador_servico for insert to authenticated with check (prestador_id = (select auth.uid()));
create policy "prestador_servico_update_proprio" on public.prestador_servico for update to authenticated using (prestador_id = (select auth.uid())) with check (prestador_id = (select auth.uid()));

grant insert (cliente_id, apelido, logradouro, numero, complemento, bairro, cidade, uf, cep, latitude, longitude) on public.endereco to authenticated;
grant update (ativo) on public.endereco to authenticated;

create policy "endereco_select_proprio_ou_prestador_do_atendimento" on public.endereco for select to authenticated using (
  cliente_id = (select auth.uid())
  or exists (select 1 from public.atendimento a where a.endereco_id = endereco.id and a.prestador_id = (select auth.uid()))
);
create policy "endereco_insert_proprio" on public.endereco for insert to authenticated with check (cliente_id = (select auth.uid()));
create policy "endereco_update_proprio" on public.endereco for update to authenticated using (cliente_id = (select auth.uid())) with check (cliente_id = (select auth.uid()));

grant insert (cliente_id, prestador_id, prestador_servico_id, endereco_id, valor_acordado, agendado_para) on public.atendimento to authenticated;
grant update (status, valor_acordado, valor_final, agendado_para, iniciado_em, finalizado_em) on public.atendimento to authenticated;

create policy "atendimento_select_participantes" on public.atendimento for select to authenticated using (
  cliente_id = (select auth.uid()) or prestador_id = (select auth.uid())
);
create policy "atendimento_insert_cliente" on public.atendimento for insert to authenticated with check (
  cliente_id = (select auth.uid())
  and cliente_id <> prestador_id
  and exists (select 1 from public.endereco e where e.id = endereco_id and e.cliente_id = (select auth.uid()) and e.ativo)
  and exists (select 1 from public.prestador_servico ps where ps.id = prestador_servico_id and ps.prestador_id = atendimento.prestador_id and ps.ativo)
);
create policy "atendimento_update_participantes" on public.atendimento for update to authenticated using (
  cliente_id = (select auth.uid()) or prestador_id = (select auth.uid())
) with check (
  cliente_id = (select auth.uid()) or prestador_id = (select auth.uid())
);

grant insert (atendimento_id, avaliador_id, avaliado_id, nota, comentario) on public.avaliacao to authenticated;

create policy "avaliacao_select_todos" on public.avaliacao for select to authenticated using (true);
create policy "avaliacao_insert_participante_concluido" on public.avaliacao for insert to authenticated with check (
  avaliador_id = (select auth.uid())
  and exists (
    select 1 from public.atendimento a
    where a.id = atendimento_id
      and a.status = 'concluido'
      and (
        (a.cliente_id = (select auth.uid()) and a.prestador_id = avaliado_id)
        or (a.prestador_id = (select auth.uid()) and a.cliente_id = avaliado_id)
      )
  )
);

grant insert (usuario_id, tipo_documento, documento_url, selfie_url) on public.verificacao to authenticated;

create policy "verificacao_select_proprio" on public.verificacao for select to authenticated using (usuario_id = (select auth.uid()));
create policy "verificacao_insert_proprio" on public.verificacao for insert to authenticated with check (usuario_id = (select auth.uid()));

grant insert (atendimento_id, usuario_id, latitude, longitude) on public.alerta_seguranca to authenticated;

create policy "alerta_select_participantes" on public.alerta_seguranca for select to authenticated using (
  exists (select 1 from public.atendimento a where a.id = atendimento_id and (a.cliente_id = (select auth.uid()) or a.prestador_id = (select auth.uid())))
);
create policy "alerta_insert_participante_ativo" on public.alerta_seguranca for insert to authenticated with check (
  usuario_id = (select auth.uid())
  and exists (
    select 1 from public.atendimento a
    where a.id = atendimento_id
      and a.status in ('aceito', 'em_andamento')
      and (a.cliente_id = (select auth.uid()) or a.prestador_id = (select auth.uid()))
  )
);

create or replace function public.atualizar_nota_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prestador uuid;
begin
  select a.prestador_id into v_prestador from public.atendimento a where a.id = new.atendimento_id;
  if new.avaliado_id = v_prestador then
    update public.prestador p set
      nota_media = coalesce((select round(avg(av.nota)::numeric, 2) from public.avaliacao av join public.atendimento a on a.id = av.atendimento_id where av.avaliado_id = new.avaliado_id and a.prestador_id = new.avaliado_id), 0),
      total_avaliacoes = (select count(*) from public.avaliacao av join public.atendimento a on a.id = av.atendimento_id where av.avaliado_id = new.avaliado_id and a.prestador_id = new.avaliado_id)
    where p.usuario_id = new.avaliado_id;
  else
    update public.cliente c set
      nota_media = coalesce((select round(avg(av.nota)::numeric, 2) from public.avaliacao av join public.atendimento a on a.id = av.atendimento_id where av.avaliado_id = new.avaliado_id and a.cliente_id = new.avaliado_id), 0),
      total_avaliacoes = (select count(*) from public.avaliacao av join public.atendimento a on a.id = av.atendimento_id where av.avaliado_id = new.avaliado_id and a.cliente_id = new.avaliado_id)
    where c.usuario_id = new.avaliado_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.atualizar_nota_media() from public, anon, authenticated;

create trigger trg_avaliacao_atualiza_nota after insert on public.avaliacao for each row execute function public.atualizar_nota_media();

create or replace function public.perfil_publico(p_ids uuid[])
returns table (id uuid, nome varchar, foto_url varchar, genero varchar, status_verificacao varchar)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.nome, u.foto_url, u.genero, u.status_verificacao
  from public.usuario u
  where u.id = any(p_ids);
$$;

revoke execute on function public.perfil_publico(uuid[]) from public, anon;
grant execute on function public.perfil_publico(uuid[]) to authenticated;
