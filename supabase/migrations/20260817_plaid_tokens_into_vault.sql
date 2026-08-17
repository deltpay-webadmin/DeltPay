-- ────────────────────────────────────────────────────────────────
-- Plaid access tokens → Supabase Vault (encrypted at rest)
-- ────────────────────────────────────────────────────────────────
-- plaid_credentials.access_token was plaintext. Tokens now live in
-- vault.secrets (name 'plaid:<item_id>'), accessed only through the
-- service-role-only functions below. The table row remains as the
-- credential marker; an AFTER DELETE trigger purges the vault secret so
-- every existing delete/cascade path stays correct. The plaintext column
-- is scrubbed by 20260817_plaid_scrub_plaintext_tokens.sql once the
-- vault-aware edge functions are deployed.

create or replace function public.plaid_token_store(p_item_id text, p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := 'plaid:' || p_item_id;
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = v_name;
  if v_id is null then
    perform vault.create_secret(p_token, v_name, 'Plaid access token');
  else
    perform vault.update_secret(v_id, p_token);
  end if;
end;
$$;

create or replace function public.plaid_token_get(p_item_id text)
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'plaid:' || p_item_id;
$$;

create or replace function public.plaid_credentials_vault_cleanup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from vault.secrets where name = 'plaid:' || old.item_id;
  return old;
end;
$$;

drop trigger if exists plaid_credentials_vault_cleanup on public.plaid_credentials;
create trigger plaid_credentials_vault_cleanup
  after delete on public.plaid_credentials
  for each row execute function public.plaid_credentials_vault_cleanup();

revoke all on function public.plaid_token_store(text, text) from public, anon, authenticated;
revoke all on function public.plaid_token_get(text) from public, anon, authenticated;
grant execute on function public.plaid_token_store(text, text) to service_role;
grant execute on function public.plaid_token_get(text) to service_role;

-- Backfill: copy every existing plaintext token into the vault.
select public.plaid_token_store(item_id, access_token)
from public.plaid_credentials
where coalesce(access_token, '') <> '';
