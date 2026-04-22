-- ================================================================
-- MIGRACIÓN: Sistema de Autenticación y Perfiles de Usuario
-- Fecha: 2026-04-22
-- Descripción: Crea tabla user_profiles para gestión de roles y datos
--              de usuario extendiendo Supabase Auth.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TABLA: user_profiles
-- Almacena datos adicionales de usuarios más allá de Supabase Auth
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id UUID NOT NULL UNIQUE,  -- Referencia al usuario en auth.users de Supabase
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_user_profiles_supabase_id ON user_profiles(supabase_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) para user_profiles
-- ----------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = supabase_id);

-- Los usuarios autenticados pueden actualizar su propio perfil (excepto el rol)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = supabase_id)
  WITH CHECK (
    auth.uid() = supabase_id
    AND role = (SELECT role FROM user_profiles WHERE supabase_id = auth.uid())
  );

-- El servicio backend (service_role) puede hacer todo
-- (Las políticas de INSERT y DELETE las maneja el backend con service_role)

-- ----------------------------------------------------------------
-- 3. FUNCIÓN: Crear perfil automáticamente al registrarse
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (supabase_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (supabase_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: se ejecuta cuando un nuevo usuario se registra en Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 4. PRIMER ADMIN (opcional - cambiar por tu email real)
-- ----------------------------------------------------------------
-- Para crear el primer admin, ejecuta esto después de registrarte:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';

-- ----------------------------------------------------------------
-- 5. COMENTARIOS Y DOCUMENTACIÓN
-- ----------------------------------------------------------------
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario extendidos que complementan Supabase Auth';
COMMENT ON COLUMN user_profiles.supabase_id IS 'UUID del usuario en auth.users de Supabase';
COMMENT ON COLUMN user_profiles.role IS 'Rol en la aplicación: admin (gestión completa) o user (acceso normal)';
