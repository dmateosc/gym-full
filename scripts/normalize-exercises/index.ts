import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://192.168.0.103:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:7b';
const DRY_RUN = process.argv.includes('--dry-run');
// --all reprocesses exercises that already have Spanish names
const ALL = process.argv.includes('--all');
// --only-instructions skips renaming, only regenerates instructions
const ONLY_INSTRUCTIONS = process.argv.includes('--only-instructions');

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

interface DbExercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  category: string;
  muscle_groups: string[];
  equipment: string[];
}

interface OllamaExercise {
  name: string;
  description: string;
  instructions: string[];
}

// Hardcoded translations for well-known exercises — LLMs are unreliable for technical terminology
const KNOWN_TRANSLATIONS: Record<string, string> = {
  // Deadlifts
  'barbell deadlift': 'Peso Muerto con Barra',
  'romanian deadlift': 'Peso Muerto Rumano',
  'romanian deadlift with dumbbells': 'Peso Muerto Rumano con Mancuernas',
  'sumo deadlift': 'Peso Muerto Sumo',
  // Squats
  'barbell full squat': 'Sentadilla Completa con Barra',
  'barbell squat': 'Sentadilla con Barra',
  'goblet squat': 'Sentadilla Goblet',
  'front squat': 'Sentadilla Frontal',
  // Olympic lifts
  'hang clean': 'Cargada Colgante',
  'clean from blocks': 'Cargada desde Bloques',
  'power clean': 'Cargada de Potencia',
  'power snatch': 'Arrancada de Potencia',
  'snatch': 'Arrancada',
  // Hip / glutes
  'barbell hip thrust': 'Hip Thrust con Barra',
  'hip thrust': 'Hip Thrust',
  'barbell glute bridge': 'Puente de Glúteos con Barra',
  // Rows
  'bent over barbell row': 'Remo Inclinado con Barra',
  'bent over row': 'Remo Inclinado',
  'cable row': 'Remo en Polea',
  'dumbbell row': 'Remo con Mancuerna',
  // Press
  'bench press': 'Press de Banca con Barra',
  'dumbbell bench press': 'Press de Banca con Mancuernas',
  'shoulder press': 'Press de Hombros',
  'overhead press': 'Press Militar',
  // Curls
  'hammer curls': 'Curl Martillo',
  'curl zottman': 'Curl Zottman',
  // Pulls
  'lat pulldown': 'Jalón al Pecho',
  'pull up': 'Dominadas',
  'pull-up': 'Dominadas',
  'chin up': 'Dominadas con Supinación',
  // Core / cardio
  'plank': 'Plancha',
  'side plank': 'Plancha Lateral',
  'elbow plank': 'Plancha sobre Codos',
  'russian twist': 'Rotación Rusa',
  'bicycle crunches': 'Crunch de Bicicleta',
  'mountain climbers': 'Escaladores',
  'high knees': 'Rodillas Altas',
  'jumping rope': 'Salto a la Comba',
  // Misc
  'tire flip': 'Volteo de Neumático',
  'landmine twist': 'Rotación con Barra Fija',
  'dumbbell flyes': 'Aperturas con Mancuernas',
  'pushups': 'Flexiones',
  'push-ups': 'Flexiones',
  'lunge': 'Zancada',
  'walking lunge': 'Zancada Caminando',
};

function getKnownTranslation(name: string): string | null {
  return KNOWN_TRANSLATIONS[name.toLowerCase().trim()] ?? null;
}

// Heuristic: name is already in Spanish if it has Spanish words or no English keywords
function looksEnglish(name: string): boolean {
  const englishWords = /\b(barbell|dumbbell|bench|press|row|squat|deadlift|curl|plank|crunch|lunge|thrust|flip|snatch|clean|hang|swing|pull|push|raise|fly|flies|overhead|incline|decline|grip|wide|narrow|single|double|cable|rope|band|machine|twist|kick|jump|run|hop|step|tire|power|hang|high|side|russian|romanian|hammer|spider|zottman)\b/i;
  return englishWords.test(name);
}

async function callOllama(exercise: DbExercise): Promise<OllamaExercise> {
  const prompt = `Eres un experto en terminología de musculación y fitness en español de España. Debes traducir el nombre de un ejercicio de gimnasio a su nombre oficial en español y escribir instrucciones claras.

REGLAS PARA EL NOMBRE:
1. USA la terminología estándar española, NO traduzcas literalmente palabra por palabra.
2. Los movimientos tienen nombres establecidos — NO los inventes:
   - Deadlift = "Peso Muerto" (NUNCA "Sentadilla")
   - Squat = "Sentadilla" (NUNCA "Peso Muerto")
   - Clean = "Cargada" (NUNCA "Peso" ni "Sentadilla")
   - Snatch = "Arrancada"
   - Row = "Remo"
   - Press = "Press"
   - Curl = "Curl"
   - Lunge = "Zancada"
   - Thrust = "Empuje" o "Hip Thrust"
   - Fly/Flyes = "Aperturas"
   - Raise = "Elevaciones"
   - Pulldown = "Jalón"
   - Plank = "Plancha"
3. Añade el equipamiento si es relevante: "con Barra", "con Mancuernas", "en Polea", "en Máquina".
4. Añade la variante si aplica: "Inclinado", "Declinado", "Rumano", "Colgante", "desde Bloques", "Agarre Cerrado".
5. Si el nombre ya está bien en español, devuélvelo igual.

TABLA DE TRADUCCIONES OBLIGATORIAS:
- Barbell Deadlift → Peso Muerto con Barra
- Romanian Deadlift → Peso Muerto Rumano
- Barbell Squat / Barbell Full Squat → Sentadilla con Barra
- Hang Clean → Cargada Colgante
- Clean from Blocks → Cargada desde Bloques
- Power Snatch → Arrancada de Potencia
- Bent Over Barbell Row → Remo Inclinado con Barra
- Dumbbell Flyes → Aperturas con Mancuernas
- Barbell Hip Thrust → Hip Thrust con Barra
- Barbell Glute Bridge → Puente de Glúteos con Barra
- Tire Flip → Volteo de Neumático
- Hammer Curls → Curl Martillo
- Shoulder Press → Press de Hombros
- Bench Press → Press de Banca
- Lat Pulldown → Jalón al Pecho
- Cable Row → Remo en Polea

EJERCICIO A PROCESAR:
Nombre original: ${exercise.name}
Categoría: ${exercise.category}
Músculos: ${exercise.muscle_groups.join(', ')}
Equipamiento: ${exercise.equipment.join(', ')}

Responde ÚNICAMENTE con este JSON, sin texto adicional, sin markdown:
{
  "name": "nombre oficial en español",
  "description": "1-2 frases: qué músculos trabaja y beneficio principal",
  "instructions": ["paso 1", "paso 2", "paso 3", "paso 4", "paso 5"]
}`;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0.2, num_predict: 600 },
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json() as { response: string };
  return JSON.parse(data.response) as OllamaExercise;
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false });

  try {
    // Select exercises that look English (or all if --all)
    const { rows: exercises } = await pool.query<DbExercise>(
      'SELECT id, name, description, instructions, category, muscle_groups, equipment FROM exercises ORDER BY name'
    );

    const targets = ALL ? exercises : exercises.filter(e => looksEnglish(e.name));
    console.log(`Found ${targets.length} exercises to normalize (${exercises.length} total)\n`);

    let updated = 0;
    let failed = 0;

    for (const exercise of targets) {
      process.stdout.write(`  ${exercise.name} ...`);

      try {
        const knownName = getKnownTranslation(exercise.name);
        const result = await callOllama(exercise);

        if (!result.name || !Array.isArray(result.instructions) || result.instructions.length < 2) {
          throw new Error('Invalid response structure');
        }

        // Dictionary takes priority over LLM for names
        const newName = ONLY_INSTRUCTIONS ? exercise.name : (knownName ?? result.name);
        const newDesc = ONLY_INSTRUCTIONS ? exercise.description : result.description;

        if (DRY_RUN) {
          console.log(` OK\n    → ${newName}\n    → ${result.instructions[0]}...`);
        } else {
          await pool.query(
            'UPDATE exercises SET name = $1, description = $2, instructions = $3 WHERE id = $4',
            [newName, newDesc, result.instructions, exercise.id]
          );
          console.log(` → ${newName}`);
          updated++;
        }
      } catch (err) {
        console.log(` ERROR: ${(err as Error).message}`);
        failed++;
      }
    }

    console.log(`\nDone — updated: ${updated}, failed: ${failed}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
