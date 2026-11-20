alter table public.categoria_servico add column slug varchar unique;
insert into public.categoria_servico (slug, nome, descricao) values
  ('eletrica', 'Eletricista', 'Elétrica'),
  ('hidraulica', 'Encanador(a)', 'Hidráulica'),
  ('pintura', 'Pintor(a)', 'Pintura'),
  ('manutencao', 'Manutenção', 'Manutenção'),
  ('montagem', 'Montador(a)', 'Montagem'),
  ('limpeza', 'Diarista', 'Limpeza'),
  ('alvenaria', 'Pedreiro(a)', 'Alvenaria'),
  ('jardinagem', 'Jardineiro(a)', 'Jardinagem');
alter table public.categoria_servico alter column slug set not null;

alter table public.prestador_servico drop constraint prestador_servico_faixa_valor;
alter table public.prestador_servico drop column valor_min, drop column valor_max, drop column unidade_cobranca;
alter table public.prestador_servico alter column descricao type text;
alter table public.prestador_servico
  add column titulo varchar not null,
  add column tipo varchar,
  add column preco decimal(10,2) not null,
  add column inclui text[] not null default '{}',
  add column criado_em timestamptz not null default now(),
  add constraint prestador_servico_preco_positivo check (preco > 0);
grant insert (titulo, tipo, preco, inclui) on public.prestador_servico to authenticated;
grant update (titulo, tipo, preco, inclui) on public.prestador_servico to authenticated;

alter table public.prestador add column atende_somente_mulheres boolean not null default false;
grant insert (atende_somente_mulheres) on public.prestador to authenticated;
grant update (atende_somente_mulheres) on public.prestador to authenticated;

alter table public.cliente drop column preferencia_genero;
alter table public.cliente add column prefere_mulheres boolean not null default false;
grant insert (prefere_mulheres) on public.cliente to authenticated;
grant update (prefere_mulheres) on public.cliente to authenticated;

alter table public.usuario add constraint usuario_genero_valido check (genero in ('feminino', 'masculino', 'outro', 'nao_informado'));

alter table public.atendimento drop constraint atendimento_status_valido;
alter table public.atendimento alter column status set default 'aguardando_prestador';
alter table public.atendimento add constraint atendimento_status_valido check (status in ('aguardando_prestador', 'confirmado', 'recusado', 'cancelado', 'concluido'));
alter table public.atendimento add column forma_pagamento varchar not null default 'pix';
alter table public.atendimento add constraint atendimento_forma_pagamento_valida check (forma_pagamento in ('pix', 'cartao'));
grant insert (forma_pagamento) on public.atendimento to authenticated;

create or replace function public.validar_mudanca_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if new.status is distinct from old.status and v_uid is not null then
    if new.status in ('confirmado', 'recusado') then
      if v_uid <> old.prestador_id or old.status <> 'aguardando_prestador' then
        raise exception 'Só o prestador pode confirmar ou recusar uma solicitação aguardando resposta.';
      end if;
    elsif new.status = 'cancelado' then
      if v_uid <> old.cliente_id or old.status not in ('aguardando_prestador', 'confirmado') then
        raise exception 'Só o cliente pode cancelar, e apenas antes da conclusão.';
      end if;
    elsif new.status = 'concluido' then
      if v_uid <> old.cliente_id or old.status <> 'confirmado' then
        raise exception 'Só o cliente pode concluir um atendimento confirmado.';
      end if;
      new.finalizado_em := now();
    else
      raise exception 'Mudança de status não permitida.';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_atendimento_valida_status before update on public.atendimento for each row execute function public.validar_mudanca_status();

drop policy "alerta_insert_participante_ativo" on public.alerta_seguranca;
create policy "alerta_insert_participante_ativo" on public.alerta_seguranca for insert to authenticated with check (
  usuario_id = (select auth.uid())
  and exists (
    select 1 from public.atendimento a
    where a.id = atendimento_id
      and a.status = 'confirmado'
      and (a.cliente_id = (select auth.uid()) or a.prestador_id = (select auth.uid()))
  )
);

alter table public.endereco drop column cidade, drop column uf;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']);

create policy "documentos_upload_proprio" on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documentos_ler_proprio" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
