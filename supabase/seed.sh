#!/bin/sh
set -e

# ── 1. Cria usuário admin via GoTrue ─────────────────────────────────────────
echo "[seed] Aguardando auth ficar pronto..."
until curl -sf http://auth:9999/health > /dev/null 2>&1; do
  sleep 3
done

echo "[seed] Auth pronto. Criando usuário admin..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://auth:9999/admin/users \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"admin1234\",\"email_confirm\":true}")

if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
  echo "[seed] Usuário criado com sucesso."
elif [ "$STATUS" = "422" ]; then
  echo "[seed] Usuário já existe, nada a fazer."
else
  echo "[seed] Resposta inesperada criando usuário: HTTP $STATUS"
  exit 1
fi

# ── 2. Corrige tenant do Realtime ─────────────────────────────────────────────
# O Realtime v2 usa o hostname do container (= "realtime") para buscar o tenant.
# A seed do Realtime cria "realtime-dev" — precisamos de um tenant "realtime".
echo "[seed] Aguardando Realtime criar tenant base..."
sleep 12

echo "[seed] Criando tenant 'realtime' no banco..."
PGPASSWORD=$POSTGRES_PASSWORD psql \
  -h db -U supabase_admin -d postgres \
  --no-password -v ON_ERROR_STOP=0 <<'SQL'
DO $$
DECLARE
  existing_jwt text;
BEGIN
  -- Pega o jwt_secret já encriptado do tenant realtime-dev (criado pelo Realtime seeds)
  SELECT jwt_secret INTO existing_jwt FROM _realtime.tenants WHERE external_id = 'realtime-dev';

  IF existing_jwt IS NULL THEN
    RAISE NOTICE 'Tenant realtime-dev não encontrado ainda, pulando.';
    RETURN;
  END IF;

  -- Insere tenant "realtime" se não existir
  IF NOT EXISTS (SELECT 1 FROM _realtime.tenants WHERE external_id = 'realtime') THEN
    INSERT INTO _realtime.tenants (
      id, name, external_id, jwt_secret,
      max_concurrent_users, max_events_per_second, max_bytes_per_second,
      max_channels_per_client, max_joins_per_second, inserted_at, updated_at
    )
    SELECT gen_random_uuid(), 'realtime', 'realtime', jwt_secret,
           max_concurrent_users, max_events_per_second, max_bytes_per_second,
           max_channels_per_client, max_joins_per_second, now(), now()
    FROM _realtime.tenants WHERE external_id = 'realtime-dev';

    -- Copia extensões (configuração PostgresCDC)
    INSERT INTO _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at)
    SELECT gen_random_uuid(), type, settings, 'realtime', now(), now()
    FROM _realtime.extensions WHERE tenant_external_id = 'realtime-dev';

    RAISE NOTICE 'Tenant realtime criado com sucesso.';
  ELSE
    RAISE NOTICE 'Tenant realtime já existe.';
  END IF;
END;
$$;
SQL

echo "[seed] Concluído."
