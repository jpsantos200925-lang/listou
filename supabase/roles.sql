-- Executado pelo migrate.sh da imagem supabase/postgres como postinit.
-- Define as senhas dos roles que GoTrue e PostgREST precisam para conectar.
ALTER USER supabase_auth_admin WITH PASSWORD 'postgres';
ALTER USER authenticator        WITH PASSWORD 'postgres';
