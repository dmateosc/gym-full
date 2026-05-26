-- Migración: eliminar dependencia de Supabase Auth
-- Añadir campo password_hash para autenticación JWT propia
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;

-- Hacer supabase_id nullable (mantener registros existentes)
ALTER TABLE user_profiles ALTER COLUMN supabase_id DROP NOT NULL;
