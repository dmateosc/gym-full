-- Migration: Create exercises table
-- Execute this SQL in your Supabase SQL Editor

-- Crear tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'endurance', 'balance', 'functional')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  estimated_duration INTEGER, -- en minutos
  calories INTEGER, -- calorías estimadas quemadas
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar la performance
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos (ejercicios públicos)
CREATE POLICY "Allow public read access" ON exercises
    FOR SELECT USING (true);

-- Política para permitir inserción a usuarios autenticados (opcional)
-- CREATE POLICY "Allow authenticated insert" ON exercises
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados (opcional)
-- CREATE POLICY "Allow authenticated update" ON exercises
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados (opcional)
-- CREATE POLICY "Allow authenticated delete" ON exercises
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Insertar datos de ejemplo
INSERT INTO exercises (name, description, category, difficulty, muscle_groups, equipment, instructions, estimated_duration, calories) VALUES
('Push-ups', 'Ejercicio clásico de fuerza para el tren superior', 'strength', 'beginner', ARRAY['Pecho', 'Tríceps', 'Hombros'], ARRAY['Peso corporal'], ARRAY['Colócate en posición de plancha con las manos en el suelo', 'Baja el cuerpo hasta que el pecho casi toque el suelo', 'Empuja hacia arriba hasta la posición inicial', 'Mantén el cuerpo en línea recta durante todo el movimiento'], 15, 100),

('Squats', 'Ejercicio fundamental para fortalecer las piernas', 'strength', 'beginner', ARRAY['Cuádriceps', 'Glúteos', 'Isquiotibiales'], ARRAY['Peso corporal'], ARRAY['Párate con los pies separados al ancho de los hombros', 'Baja como si fueras a sentarte en una silla', 'Mantén el peso en los talones', 'Regresa a la posición inicial'], 20, 150),

('Running', 'Ejercicio cardiovascular básico', 'cardio', 'intermediate', ARRAY['Piernas', 'Core'], ARRAY['Zapatillas deportivas'], ARRAY['Calienta con una caminata de 5 minutos', 'Comienza a trotar a un ritmo cómodo', 'Mantén una postura erguida', 'Termina con una caminata de enfriamiento'], 30, 300),

('Plancha', 'Ejercicio isométrico para fortalecer el core', 'strength', 'beginner', ARRAY['Core', 'Hombros', 'Espalda'], ARRAY['Peso corporal'], ARRAY['Colócate en posición de plancha sobre los antebrazos', 'Mantén el cuerpo en línea recta', 'Contrae los músculos del core', 'Mantén la posición durante el tiempo indicado'], 10, 50),

('Yoga Flow', 'Secuencia de yoga para flexibilidad', 'flexibility', 'intermediate', ARRAY['Todo el cuerpo'], ARRAY['Esterilla de yoga'], ARRAY['Comienza en posición de montaña', 'Fluye a través de las posturas básicas', 'Mantén la respiración profunda', 'Termina en savasana'], 25, 80);

-- Comentario: Los ejercicios de ejemplo están listos para usar
-- Puedes agregar más ejercicios según tus necesidades
