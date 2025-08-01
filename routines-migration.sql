-- Migración para crear tablas de rutinas diarias
-- Ejecutar en Supabase para crear las nuevas tablas relacionadas con daily_routines

-- Tabla principal de rutinas diarias
CREATE TABLE daily_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    routine_date DATE NOT NULL,
    intensity VARCHAR(20) NOT NULL DEFAULT 'moderate' CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0 AND estimated_duration_minutes <= 480),
    estimated_calories INTEGER CHECK (estimated_calories >= 0),
    goals TEXT[],
    warm_up_notes TEXT,
    cool_down_notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    actual_duration_minutes INTEGER CHECK (actual_duration_minutes > 0),
    completion_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabla intermedia que relaciona rutinas con ejercicios
CREATE TABLE routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_routine_id UUID NOT NULL REFERENCES daily_routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    order_in_routine INTEGER NOT NULL CHECK (order_in_routine > 0),
    exercise_type VARCHAR(20) NOT NULL DEFAULT 'sets_reps' CHECK (exercise_type IN ('sets_reps', 'time_based', 'distance', 'reps_only')),
    sets INTEGER CHECK (sets > 0),
    reps INTEGER CHECK (reps > 0),
    weight DECIMAL(5,2) CHECK (weight >= 0),
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    distance_meters DECIMAL(6,2) CHECK (distance_meters >= 0),
    rest_seconds INTEGER DEFAULT 60 CHECK (rest_seconds >= 0),
    notes TEXT,
    intensity VARCHAR(20) CHECK (intensity IN ('light', 'moderate', 'intense')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_daily_routines_routine_date ON daily_routines(routine_date);
CREATE INDEX idx_daily_routines_status ON daily_routines(status);
CREATE INDEX idx_daily_routines_date_status ON daily_routines(routine_date, status);

CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(daily_routine_id);
CREATE INDEX idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);
CREATE INDEX idx_routine_exercises_order ON routine_exercises(daily_routine_id, order_in_routine);

-- Constraint única para evitar rutinas duplicadas por fecha (solo una rutina por día)
CREATE UNIQUE INDEX idx_unique_routine_per_date 
ON daily_routines(routine_date);

-- Constraint única para evitar ejercicios duplicados en el mismo orden de una rutina
ALTER TABLE routine_exercises 
ADD CONSTRAINT unique_order_per_routine 
UNIQUE (daily_routine_id, order_in_routine);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_routines_updated_at 
    BEFORE UPDATE ON daily_routines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_exercises_updated_at 
    BEFORE UPDATE ON routine_exercises 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar las tablas
COMMENT ON TABLE daily_routines IS 'Rutinas de ejercicio organizadas por día de la semana';
COMMENT ON TABLE routine_exercises IS 'Ejercicios específicos dentro de cada rutina diaria con configuraciones de series, repeticiones, etc.';

COMMENT ON COLUMN daily_routines.estimated_duration_minutes IS 'Duración estimada total de la rutina en minutos';
COMMENT ON COLUMN daily_routines.estimated_calories IS 'Calorías estimadas a quemar en toda la rutina';
COMMENT ON COLUMN daily_routines.goals IS 'Objetivos de la rutina: strength, cardio, flexibility, etc.';
COMMENT ON COLUMN daily_routines.warm_up_notes IS 'Notas sobre calentamiento';
COMMENT ON COLUMN daily_routines.cool_down_notes IS 'Notas sobre enfriamiento';
COMMENT ON COLUMN daily_routines.routine_date IS 'Fecha específica para la cual está programada la rutina';
COMMENT ON COLUMN daily_routines.status IS 'Estado de la rutina: planned, in_progress, completed, skipped';
COMMENT ON COLUMN daily_routines.started_at IS 'Momento en que se inició la rutina';
COMMENT ON COLUMN daily_routines.completed_at IS 'Momento en que se completó la rutina';
COMMENT ON COLUMN daily_routines.actual_duration_minutes IS 'Duración real que tomó completar la rutina';
COMMENT ON COLUMN daily_routines.completion_notes IS 'Notas sobre la ejecución de la rutina';

COMMENT ON COLUMN routine_exercises.order_in_routine IS 'Orden del ejercicio en la rutina (1, 2, 3...)';
COMMENT ON COLUMN routine_exercises.exercise_type IS 'Tipo de ejercicio: sets_reps, time_based, distance, reps_only';
COMMENT ON COLUMN routine_exercises.sets IS 'Número de series (para sets_reps)';
COMMENT ON COLUMN routine_exercises.reps IS 'Número de repeticiones por serie (para sets_reps o reps_only)';
COMMENT ON COLUMN routine_exercises.weight IS 'Peso en kg (para ejercicios con peso)';
COMMENT ON COLUMN routine_exercises.duration_seconds IS 'Duración en segundos (para time_based)';
COMMENT ON COLUMN routine_exercises.distance_meters IS 'Distancia en metros (para distance)';
COMMENT ON COLUMN routine_exercises.rest_seconds IS 'Tiempo de descanso en segundos después del ejercicio';
COMMENT ON COLUMN routine_exercises.notes IS 'Notas específicas para este ejercicio (técnica, modificaciones, etc.)';
COMMENT ON COLUMN routine_exercises.intensity IS 'Intensidad específica: light, moderate, intense';

-- Habilitar RLS (Row Level Security) si es necesario
-- ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Política de ejemplo para RLS (comentado por defecto)
-- CREATE POLICY "Users can view their own routines" ON daily_routines
--     FOR SELECT USING (auth.uid() = user_id);
