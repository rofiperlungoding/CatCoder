-- Application error logs.
--
-- Stores caught client-side exceptions (React error boundary, async failures,
-- AI pipeline errors, …) so we can triage incidents without paying for an
-- external error tracker.

create table if not exists public.error_logs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  user_id         uuid references auth.users(id) on delete set null,
  area            text not null,
  message         text not null,
  stack           text,
  component_stack text,
  extra           jsonb,
  client_user_agent text
);

create index if not exists error_logs_created_at_idx on public.error_logs (created_at desc);
create index if not exists error_logs_area_idx on public.error_logs (area);
create index if not exists error_logs_user_idx on public.error_logs (user_id);

alter table public.error_logs enable row level security;

-- Authenticated users may only INSERT (write-only). Reads are service-role
-- only so end-users can't enumerate other users' incidents.
drop policy if exists "error_logs_insert_authenticated" on public.error_logs;
create policy "error_logs_insert_authenticated"
  on public.error_logs
  for insert
  to authenticated
  with check (
    -- A signed-in user may only attribute reports to their own id (or NULL).
    user_id is null or user_id = auth.uid()
  );

drop policy if exists "error_logs_insert_anon" on public.error_logs;
create policy "error_logs_insert_anon"
  on public.error_logs
  for insert
  to anon
  with check (user_id is null);

-- RPC: log_app_error
--
-- Public-callable wrapper that the client-side `errorReporter` invokes.
-- SECURITY DEFINER ensures the row gets written even when the caller's RLS
-- session can't insert directly; the WITH CHECK clauses above are still
-- enforced by the function body.

create or replace function public.log_app_error(
  p_area text,
  p_message text,
  p_stack text default null,
  p_component_stack text default null,
  p_user_id uuid default null,
  p_extra jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_inserted uuid;
begin
  v_caller := auth.uid();

  -- Attribute the row to the caller when possible. Reject attempts to
  -- impersonate another user.
  if p_user_id is not null and v_caller is not null and p_user_id <> v_caller then
    raise exception 'cannot attribute error to another user';
  end if;

  insert into public.error_logs (user_id, area, message, stack, component_stack, extra, client_user_agent)
  values (
    coalesce(p_user_id, v_caller),
    coalesce(nullif(p_area, ''), 'unknown'),
    coalesce(nullif(p_message, ''), '(no message)'),
    p_stack,
    p_component_stack,
    p_extra,
    nullif(coalesce(p_extra ->> 'userAgent', ''), '')
  )
  returning id into v_inserted;

  return v_inserted;
end;
$$;

revoke all on function public.log_app_error from public;
grant execute on function public.log_app_error to anon, authenticated;

comment on function public.log_app_error is
  'Records a client-side caught exception. Prefer calling via the errorReporter helper.';
