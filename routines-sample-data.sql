-- Datos de ejemplo para las rutinas diarias (agosto 2025)
-- Primero insertamos algunas rutinas de ejemplo

-- Rutina para hoy (1 de agosto, 2025)
INSERT INTO daily_routines (
    name, 
    description, 
    routine_date, 
    intensity, 
    status,
    estimated_duration_minutes, 
    estimated_calories,
    goals, 
    warm_up_notes, 
    cool_down_notes
) VALUES 
(
    'Entrenamiento de Fuerza - Tren Superior',
    'Rutina completa para trabajar pecho, espalda, hombros y brazos',
    '2025-08-01',
    'high',
    'planned',
    60,
    400,
    ARRAY['strength', 'muscle_building'],
    'Calentamiento de 10 minutos con movilidad articular',
    'Estiramiento de 10 minutos enfocado en tren superior'
),
(
    'Cardio Intenso HIIT',
    'Entrenamiento cardiovascular de alta intensidad',
    '2025-08-02',
    'very_high',
    'planned',
    45,
    350,
    ARRAY['cardio', 'fat_loss'],
    'Calentamiento dinámico de 5 minutos',
    'Enfriamiento gradual con caminata'
),
(
    'Yoga y Flexibilidad',
    'Sesión de yoga para mejorar flexibilidad y relajación',
    '2025-08-03',
    'low',
    'planned',
    75,
    200,
    ARRAY['flexibility', 'relaxation'],
    'Respiración profunda y meditación',
    'Relajación final en posición savasana'
),
(
    'Entrenamiento Funcional',
    'Ejercicios funcionales para mejorar fuerza y coordinación',
    '2025-08-04',
    'moderate',
    'planned',
    50,
    300,
    ARRAY['functional', 'coordination'],
    'Activación del core y movilidad',
    'Estiramiento funcional'
),
(
    'Entrenamiento de Piernas',
    'Rutina completa para cuádriceps, glúteos y pantorrillas',
    '2025-08-05',
    'high',
    'planned',
    70,
    450,
    ARRAY['strength', 'lower_body'],
    'Calentamiento específico para piernas',
    'Estiramiento profundo de piernas'
);

-- Ahora insertamos ejercicios específicos para algunas rutinas
-- Primero necesitamos obtener los IDs de las rutinas y algunos ejercicios

-- Para la rutina del 1 de agosto (Tren Superior)
WITH routine_today AS (
    SELECT id FROM daily_routines WHERE routine_date = '2025-08-01' LIMIT 1
),
push_up AS (
    SELECT id FROM exercises WHERE name ILIKE '%push%up%' OR name ILIKE '%flexion%' LIMIT 1
),
pull_up AS (
    SELECT id FROM exercises WHERE name ILIKE '%pull%up%' OR name ILIKE '%dominada%' LIMIT 1
),
bench_press AS (
    SELECT id FROM exercises WHERE name ILIKE '%bench%press%' OR name ILIKE '%press%banca%' LIMIT 1
)
INSERT INTO routine_exercises (
    daily_routine_id,
    exercise_id,
    order_in_routine,
    exercise_type,
    sets,
    reps,
    rest_seconds,
    notes,
    intensity
)
SELECT 
    routine_today.id,
    push_up.id,
    1,
    'sets_reps',
    3,
    12,
    90,
    'Mantener la forma correcta durante todo el movimiento',
    'moderate'
FROM routine_today, push_up
WHERE push_up.id IS NOT NULL
UNION SELECT 
    routine_today.id,
    pull_up.id,
    2,
    'sets_reps',
    3,
    8,
    120,
    'Si no se pueden hacer dominadas, usar banda de asistencia',
    'intense'
FROM routine_today, pull_up
WHERE pull_up.id IS NOT NULL
UNION SELECT 
    routine_today.id,
    bench_press.id,
    3,
    'sets_reps',
    4,
    10,
    180,
    'Peso progresivo, calentar bien antes',
    'intense'
FROM routine_today, bench_press
WHERE bench_press.id IS NOT NULL;

-- Para la rutina del 2 de agosto (Cardio HIIT)
WITH routine_cardio AS (
    SELECT id FROM daily_routines WHERE routine_date = '2025-08-02' LIMIT 1
),
burpees AS (
    SELECT id FROM exercises WHERE name ILIKE '%burpee%' LIMIT 1
),
jumping_jacks AS (
    SELECT id FROM exercises WHERE name ILIKE '%jumping%jack%' OR name ILIKE '%salto%tijera%' LIMIT 1
),
mountain_climbers AS (
    SELECT id FROM exercises WHERE name ILIKE '%mountain%climber%' OR name ILIKE '%escalador%' LIMIT 1
)
INSERT INTO routine_exercises (
    daily_routine_id,
    exercise_id,
    order_in_routine,
    exercise_type,
    duration_seconds,
    rest_seconds,
    notes,
    intensity
)
SELECT 
    routine_cardio.id,
    burpees.id,
    1,
    'time_based',
    45,
    15,
    '4 rounds de 45 segundos trabajo, 15 descanso',
    'very_high'
FROM routine_cardio, burpees
WHERE burpees.id IS NOT NULL
UNION SELECT 
    routine_cardio.id,
    jumping_jacks.id,
    2,
    'time_based',
    30,
    30,
    'Mantener ritmo constante',
    'moderate'
FROM routine_cardio, jumping_jacks
WHERE jumping_jacks.id IS NOT NULL
UNION SELECT 
    routine_cardio.id,
    mountain_climbers.id,
    3,
    'time_based',
    60,
    30,
    'Mantener core activado',
    'intense'
FROM routine_cardio, mountain_climbers
WHERE mountain_climbers.id IS NOT NULL;

-- Para la rutina del 3 de agosto (Yoga)
WITH routine_yoga AS (
    SELECT id FROM daily_routines WHERE routine_date = '2025-08-03' LIMIT 1
),
plank AS (
    SELECT id FROM exercises WHERE name ILIKE '%plank%' OR name ILIKE '%plancha%' LIMIT 1
),
warrior_pose AS (
    SELECT id FROM exercises WHERE name ILIKE '%warrior%' OR name ILIKE '%guerrero%' LIMIT 1
)
INSERT INTO routine_exercises (
    daily_routine_id,
    exercise_id,
    order_in_routine,
    exercise_type,
    duration_seconds,
    rest_seconds,
    notes,
    intensity
)
SELECT 
    routine_yoga.id,
    plank.id,
    1,
    'time_based',
    60,
    30,
    'Mantener respiración constante',
    'light'
FROM routine_yoga, plank
WHERE plank.id IS NOT NULL;

-- Comentarios para documentar los datos de ejemplo
COMMENT ON TABLE daily_routines IS 'Rutinas de ejercicio organizadas por fecha específica con seguimiento de progreso';
COMMENT ON TABLE routine_exercises IS 'Ejercicios específicos dentro de cada rutina diaria con configuraciones detalladas';

-- Verificar que los datos se insertaron correctamente
SELECT 
    dr.name as routine_name,
    dr.routine_date,
    dr.status,
    dr.intensity,
    COUNT(re.id) as total_exercises
FROM daily_routines dr
LEFT JOIN routine_exercises re ON dr.id = re.daily_routine_id
WHERE dr.routine_date >= '2025-08-01' AND dr.routine_date <= '2025-08-05'
GROUP BY dr.id, dr.name, dr.routine_date, dr.status, dr.intensity
ORDER BY dr.routine_date;
