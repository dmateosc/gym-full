import { Pool, PoolClient } from 'pg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
}

interface OllamaExercise {
  exerciseId: string;
  order: number;
  exerciseType: 'sets_reps' | 'time_based' | 'distance' | 'reps_only';
  sets?: number;
  reps?: number;
  weight?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number;
  notes?: string | null;
}

interface OllamaRoutine {
  name: string;
  description: string;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  estimatedDurationMinutes: number;
  estimatedCalories: number;
  goals: string[];
  warmUpNotes: string;
  coolDownNotes: string;
  exercises: OllamaExercise[];
}

// ─── Weekly schedule ──────────────────────────────────────────────────────────

type DaySchedule = {
  muscleGroups: string[];
  goals: string[];
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
} | null;

const WEEKLY_SCHEDULE: Record<number, DaySchedule> = {
  0: null, // Sunday — rest
  1: { muscleGroups: ['Pecho', 'Tríceps', 'Deltoides'],           goals: ['fuerza', 'pecho', 'empuje'],     intensity: 'high' },
  2: { muscleGroups: ['Dorsales', 'Bíceps', 'Trapecios'],         goals: ['fuerza', 'espalda', 'tirón'],    intensity: 'high' },
  3: { muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], goals: ['fuerza', 'piernas'],             intensity: 'high' },
  4: { muscleGroups: ['Pecho', 'Deltoides', 'Tríceps'],           goals: ['hipertrofia', 'pecho', 'empuje'],intensity: 'moderate' },
  5: { muscleGroups: ['Dorsales', 'Bíceps', 'Romboides'],         goals: ['hipertrofia', 'espalda', 'tirón'],intensity: 'moderate' },
  6: { muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], goals: ['fuerza', 'piernas', 'funcional'],intensity: 'moderate' },
};

// ─── Config from env ──────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
const DATABASE_SSL = process.env.DATABASE_SSL !== 'false';

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is required');
  process.exit(1);
}

// ─── Ollama ───────────────────────────────────────────────────────────────────

async function callOllama(prompt: string): Promise<OllamaRoutine> {
  console.log(`🤖  Calling Ollama (${OLLAMA_MODEL})...`);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      format: 'json',
      stream: false,
      // Los modelos con modo razonamiento (p.ej. qwen3) desvían la salida al
      // campo `thinking` y dejan `response` vacío, rompiendo el JSON.parse.
      // Desactivamos el thinking para que el JSON venga siempre en `response`.
      think: false,
      options: { temperature: 0.7, num_predict: 1024 },
    }),
    signal: AbortSignal.timeout(300_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama HTTP ${response.status}: ${body}`);
  }

  const data = await response.json() as { response: string; thinking?: string };
  // Fallback defensivo: si algún modelo ignora think:false y coloca el JSON en
  // `thinking`, lo usamos en vez de fallar con un `response` vacío.
  const raw = data.response?.trim() ? data.response : (data.thinking ?? '');
  return JSON.parse(raw) as OllamaRoutine;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  date: string,
  muscleGroups: string[],
  goals: string[],
  intensity: string,
  exercises: Exercise[],
): string {
  const exerciseList = exercises
    .map((e) => `{"id":"${e.id}","name":"${e.name}","muscleGroups":${JSON.stringify(e.muscle_groups)}}`)
    .join(',\n  ');

  return `Eres un entrenador personal profesional. Genera una rutina de gimnasio en JSON.

Ejercicios disponibles (usa los "id" exactos de esta lista):
[
  ${exerciseList}
]

Parámetros:
- Fecha: ${date}
- Grupos musculares objetivo: ${muscleGroups.join(', ')}
- Objetivos: ${goals.join(', ')}
- Intensidad: ${intensity}
- Incluye entre 6 y 8 ejercicios
- Usa exerciseType "sets_reps" para fuerza (con sets y reps realistas)
- Usa exerciseType "time_based" para cardio (con durationSeconds)
- restSeconds entre 60 y 90 para fuerza, 30-45 para cardio

Responde ÚNICAMENTE con este JSON (sin texto adicional):
{
  "name": "nombre corto de la rutina",
  "description": "descripción breve de 2 frases",
  "intensity": "${intensity}",
  "estimatedDurationMinutes": 60,
  "estimatedCalories": 400,
  "goals": ${JSON.stringify(goals)},
  "warmUpNotes": "calentamiento 5-10 min",
  "coolDownNotes": "estiramientos 5 min",
  "exercises": [
    {
      "exerciseId": "id-exacto-de-la-lista",
      "order": 1,
      "exerciseType": "sets_reps",
      "sets": 4,
      "reps": 10,
      "weight": null,
      "durationSeconds": null,
      "restSeconds": 75,
      "notes": null
    }
  ]
}`;
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function getExercises(client: PoolClient): Promise<Exercise[]> {
  const result = await client.query<Exercise>(
    'SELECT id, name, category, muscle_groups FROM exercises ORDER BY name',
  );
  return result.rows;
}

async function findRoutineByDate(client: PoolClient, date: string): Promise<string | null> {
  const result = await client.query<{ id: string }>(
    'SELECT id FROM daily_routines WHERE routine_date = $1',
    [date],
  );
  return result.rows[0]?.id ?? null;
}

async function insertRoutine(client: PoolClient, data: {
  name: string;
  description: string;
  routineDate: string;
  intensity: string;
  estimatedDurationMinutes: number;
  estimatedCalories: number;
  goals: string[];
  warmUpNotes: string;
  coolDownNotes: string;
}): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO daily_routines
       (name, description, routine_date, intensity, status,
        estimated_duration_minutes, estimated_calories,
        goals, warm_up_notes, cool_down_notes)
     VALUES ($1,$2,$3,$4,'planned',$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      data.name,
      data.description,
      data.routineDate,
      data.intensity,
      data.estimatedDurationMinutes,
      data.estimatedCalories,
      data.goals,
      data.warmUpNotes,
      data.coolDownNotes,
    ],
  );
  return result.rows[0].id;
}

async function insertRoutineExercise(client: PoolClient, data: {
  dailyRoutineId: string;
  exerciseId: string;
  orderInRoutine: number;
  exerciseType: string;
  sets?: number;
  reps?: number;
  weight?: number | null;
  durationSeconds?: number | null;
  restSeconds: number;
  notes?: string | null;
}): Promise<void> {
  await client.query(
    `INSERT INTO routine_exercises
       (daily_routine_id, exercise_id, order_in_routine, exercise_type,
        sets, reps, weight, duration_seconds, rest_seconds, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      data.dailyRoutineId,
      data.exerciseId,
      data.orderInRoutine,
      data.exerciseType,
      data.sets ?? null,
      data.reps ?? null,
      data.weight ?? null,
      data.durationSeconds ?? null,
      data.restSeconds,
      data.notes ?? null,
    ],
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dateArg = process.argv[2];
  const date = dateArg ?? new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    console.error(`❌  Invalid date "${date}". Expected YYYY-MM-DD.`);
    process.exit(1);
  }

  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const schedule = WEEKLY_SCHEDULE[dayOfWeek];

  if (schedule === undefined) {
    console.error(`❌  Unsupported dayOfWeek=${dayOfWeek} for date ${date}`);
    process.exit(1);
  }

  console.log(`📅  Date: ${date} (day ${dayOfWeek})`);

  if (schedule === null) {
    console.log('😴  Sunday — rest day. No routine generated.');
    return;
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_SSL ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    const existing = await findRoutineByDate(client, date);
    if (existing) {
      console.log(`✅  Routine already exists for ${date} (id=${existing}). Skipping.`);
      return;
    }

    const allExercises = await getExercises(client);
    console.log(`💪  ${allExercises.length} exercises loaded from DB`);

    // Filter to relevant muscle groups; fallback to strength if too few
    const relevant = allExercises.filter((e) =>
      e.muscle_groups?.some((mg) =>
        schedule.muscleGroups.some(
          (t) => mg.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(mg.toLowerCase()),
        ),
      ),
    );
    const exercises = relevant.length >= 5 ? relevant : allExercises.filter((e) => e.category === 'strength');
    console.log(`🎯  Muscles: ${schedule.muscleGroups.join(', ')} — ${exercises.length} relevant exercises`);

    const prompt = buildPrompt(date, schedule.muscleGroups, schedule.goals, schedule.intensity, exercises);
    const generated = await callOllama(prompt);

    // Validate exercise IDs
    const validIds = new Set(allExercises.map((e) => e.id));
    const validExercises = generated.exercises.filter((e) => validIds.has(e.exerciseId));

    if (validExercises.length === 0) {
      throw new Error('Ollama returned no valid exercise IDs. Aborting.');
    }
    generated.exercises = validExercises;

    // Persist
    await client.query('BEGIN');

    const routineId = await insertRoutine(client, {
      name: generated.name,
      description: generated.description,
      routineDate: date,
      intensity: generated.intensity ?? schedule.intensity,
      estimatedDurationMinutes: generated.estimatedDurationMinutes,
      estimatedCalories: generated.estimatedCalories,
      goals: generated.goals,
      warmUpNotes: generated.warmUpNotes,
      coolDownNotes: generated.coolDownNotes,
    });

    for (const ex of generated.exercises) {
      await insertRoutineExercise(client, {
        dailyRoutineId: routineId,
        exerciseId: ex.exerciseId,
        orderInRoutine: ex.order,
        exerciseType: ex.exerciseType ?? 'sets_reps',
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        durationSeconds: ex.durationSeconds,
        restSeconds: ex.restSeconds ?? 60,
        notes: ex.notes,
      });
    }

    await client.query('COMMIT');

    console.log(`✅  Routine created: "${generated.name}" (id=${routineId})`);
    console.log(`   ${generated.exercises.length} exercises — ${generated.estimatedDurationMinutes} min — ${generated.estimatedCalories} kcal`);
    generated.exercises.forEach((ex, i) => {
      const detail = ex.sets && ex.reps ? `${ex.sets}x${ex.reps}` : ex.durationSeconds ? `${ex.durationSeconds}s` : '';
      console.log(`   ${i + 1}. ${ex.exerciseId} [${ex.exerciseType}] ${detail}`);
    });

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ ', err instanceof Error ? err.message : err);
  process.exit(1);
});
