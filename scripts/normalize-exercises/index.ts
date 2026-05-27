import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://192.168.0.103:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
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

// Heuristic: name is already in Spanish if it has Spanish words or no English keywords
function looksEnglish(name: string): boolean {
  const englishWords = /\b(barbell|dumbbell|bench|press|row|squat|deadlift|curl|plank|crunch|lunge|thrust|flip|snatch|clean|hang|swing|pull|push|raise|fly|flies|overhead|incline|decline|grip|wide|narrow|single|double|cable|rope|band|machine|twist|kick|jump|run|hop|step|tire|power|hang|high|side|russian|romanian|hammer|spider|zottman)\b/i;
  return englishWords.test(name);
}

async function callOllama(exercise: DbExercise): Promise<OllamaExercise> {
  const prompt = `Eres un entrenador personal experto. Dado el siguiente ejercicio:

Nombre original: ${exercise.name}
Categoría: ${exercise.category}
Músculos: ${exercise.muscle_groups.join(', ')}
Equipamiento: ${exercise.equipment.join(', ')}
Descripción actual: ${exercise.description || 'No disponible'}

Genera en español:
1. Un nombre claro y natural (ej: "Curl de Bíceps con Barra", "Sentadilla con Barra", "Puente de Glúteos")
2. Una descripción breve de 1-2 frases
3. Entre 4 y 6 pasos concisos de cómo ejecutarlo correctamente

Responde SOLO con JSON válido, sin texto adicional:
{
  "name": "nombre en español",
  "description": "descripción breve",
  "instructions": ["paso 1", "paso 2", "paso 3", "paso 4"]
}`;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0.4, num_predict: 512 },
    }),
    signal: AbortSignal.timeout(120_000),
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
        const result = await callOllama(exercise);

        if (!result.name || !Array.isArray(result.instructions) || result.instructions.length < 2) {
          throw new Error('Invalid response structure');
        }

        const newName = ONLY_INSTRUCTIONS ? exercise.name : result.name;
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
