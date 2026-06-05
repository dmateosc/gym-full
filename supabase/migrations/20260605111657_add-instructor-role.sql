-- Migración: añadir rol 'instructor' al enum de roles permitidos
-- Contexto: prepara el sistema para clases colectivas; los instructores
-- gestionan sus propias clases recurrentes (capacidad, horario, asistentes).
-- La columna `role` ya es VARCHAR(20) → cabe 'instructor' sin cambio de tipo.
-- Añadimos un CHECK constraint para validar a nivel BD que solo se acepten
-- los 3 roles oficiales.

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'instructor', 'user'));
