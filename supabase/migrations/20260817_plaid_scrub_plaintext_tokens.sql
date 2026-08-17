-- Scrub plaintext Plaid tokens now that the vault-aware edge functions
-- are deployed (tokens were backfilled into vault.secrets by
-- 20260817_plaid_tokens_into_vault.sql). The empty string is the
-- "vaulted" marker; plaid_token_get is the only read path.
update public.plaid_credentials set access_token = '' where access_token <> '';
alter table public.plaid_credentials alter column access_token set default '';
