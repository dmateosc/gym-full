import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://192.168.0.103:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
const DRY_RUN = process.argv.includes('--dry-run');
// --skip-translate: import without translating (faster, useful for testing)
const SKIP_TRANSLATE = process.argv.includes('--skip-translate');
// --max N: limit total exercises imported
const maxArg = process.argv.indexOf('--max');
const MAX = maxArg !== -1 ? parseInt(process.argv[maxArg + 1], 10) : Infinity;

const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const API_BASE = `https://${RAPIDAPI_HOST}/api/v1`;

if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }
if (!RAPIDAPI_KEY) { console.error('Missing RAPIDAPI_KEY'); process.exit(1); }

// ---- Category / difficulty mappings ----
const CATEGORY_MAP: Record<string, string> = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  STRETCHING: 'flexibility',
  FLEXIBILITY: 'flexibility',
  PLYOMETRICS: 'functional',
  POWERLIFTING: 'strength',
  STRONGMAN: 'strength',
  'OLYMPIC WEIGHTLIFTING': 'strength',
  BALANCE: 'balance',
  FUNCTIONAL: 'functional',
};

// ---- Equipment normalization ----
const EQUIPMENT_MAP: Record<string, string> = {
  'BODY WEIGHT': 'Peso corporal',
  'BARBELL': 'Barra',
  'DUMBBELL': 'Mancuernas',
  'DUMBBELLS': 'Mancuernas',
  'CABLE': 'Polea/Cable',
  'MACHINE': 'Máquina',
  'KETTLEBELL': 'Pesas rusas',
  'KETTLEBELLS': 'Pesas rusas',
  'RESISTANCE BAND': 'Bandas',
  'BANDS': 'Bandas',
  'MEDICINE BALL': 'Balón medicinal',
  'EXERCISE BALL': 'Pelota de ejercicio',
  'FOAM ROLL': 'Foam roller',
  'EZ BAR': 'Barra EZ',
  'EZ CURL BAR': 'Barra EZ',
  'OTHER': 'Otro',
  'NONE': 'Peso corporal',
};

// ---- Muscle group normalization ----
const MUSCLE_MAP: Record<string, string> = {
  'SHOULDERS': 'Deltoides',
  'ANTERIOR DELTOID': 'Deltoides',
  'POSTERIOR DELTOID': 'Deltoides',
  'LATERAL DELTOID': 'Deltoides',
  'HAMSTRINGS': 'Isquiotibiales',
  'GLUTES': 'Glúteos',
  'GLUTEUS MAXIMUS': 'Glúteos',
  'GLUTEUS MEDIUS': 'Glúteos',
  'QUADRICEPS': 'Cuádriceps',
  'TRICEPS': 'Tríceps',
  'CALVES': 'Gemelos',
  'SOLEUS': 'Gemelos',
  'ABDOMINALS': 'Abdominales',
  'OBLIQUES': 'Abdominales',
  'RECTUS ABDOMINIS': 'Abdominales',
  'CHEST': 'Pecho',
  'PECTORALIS MAJOR': 'Pecho',
  'LOWER BACK': 'Lumbar',
  'ERECTOR SPINAE': 'Lumbar',
  'BICEPS': 'Bíceps',
  'FOREARMS': 'Antebrazos',
  'MIDDLE BACK': 'Espalda media',
  'RHOMBOIDS': 'Espalda media',
  'TRAPS': 'Trapecios',
  'TRAPEZIUS': 'Trapecios',
  'LATS': 'Dorsales',
  'LATISSIMUS DORSI': 'Dorsales',
  'ADDUCTORS': 'Aductores',
  'ADDUCTOR BREVIS': 'Aductores',
  'ADDUCTOR LONGUS': 'Aductores',
  'ADDUCTOR MAGNUS': 'Aductores',
  'ABDUCTORS': 'Abductores',
  'NECK': 'Cuello',
  'HIPS': 'Cadera',
  'ILIOPSOAS': 'Cadera',
  'TENSOR FASCIAE LATAE': 'Cadera',
  'PECTINEUS': 'Aductores',
  'WAIST': 'Abdominales',
  'UPPER ARMS': 'Bíceps',
  'THIGHS': 'Cuádriceps',
  'BACK': 'Espalda',
  'FULL BODY': 'Cuerpo completo',
  'FACE': 'Cara',
  'FEET': 'Pies',
  'HANDS': 'Manos',
  'BICEPS FEMORIS': 'Isquiotibiales',
};

function normalizeEquipment(equips: string[]): string[] {
  const result = [...new Set(equips.map(e => EQUIPMENT_MAP[e.toUpperCase()] ?? 'Otro'))];
  return result.length ? result : ['Peso corporal'];
}

function normalizeMuscles(muscles: string[]): string[] {
  return [...new Set(muscles.map(m => MUSCLE_MAP[m.toUpperCase()] ?? m))];
}

function mapCategory(type: string): string {
  return CATEGORY_MAP[type?.toUpperCase()] ?? 'strength';
}

// ---- API fetch helpers ----
const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': RAPIDAPI_HOST,
  'x-rapidapi-key': RAPIDAPI_KEY!,
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchListPage(cursor?: string): Promise<{ exercises: any[]; nextCursor: string | null }> {
  const url = `${API_BASE}/exercises?limit=25` + (cursor ? `&cursor=${cursor}` : '');
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  if (res.status === 429) throw new Error('Rate limit exceeded — wait before retrying');
  if (!res.ok) throw new Error(`List HTTP ${res.status}`);
  const data = await res.json() as any;
  return {
    exercises: data.data,
    nextCursor: data.meta.hasNextPage ? data.meta.nextCursor : null,
  };
}

async function fetchDetail(exerciseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/exercises/${exerciseId}`, { headers, signal: AbortSignal.timeout(30_000) });
  if (res.status === 429) throw new Error('Rate limit exceeded');
  if (!res.ok) throw new Error(`Detail HTTP ${res.status}: ${exerciseId}`);
  const data = await res.json() as any;
  return data.data;
}

// ---- Ollama translation ----
async function translateWithOllama(name: string, description: string, instructions: string[]): Promise<{
  name: string;
  description: string;
  instructions: string[];
}> {
  const prompt = `Eres un experto en fitness en español de España. Traduce al español estos datos de un ejercicio.

REGLAS:
- Usa terminología estándar española de gimnasio
- Deadlift = "Peso Muerto", Squat = "Sentadilla", Clean = "Cargada", Row = "Remo", Press = "Press", Curl = "Curl", Lunge = "Zancada", Plank = "Plancha", Thrust = "Hip Thrust", Fly = "Aperturas"
- Si el nombre ya está en español, mantenlo igual
- Las instrucciones deben ser claras y concisas

EJERCICIO:
Nombre: ${name}
Descripción: ${description?.slice(0, 300) ?? ''}
Instrucciones: ${JSON.stringify(instructions.slice(0, 4))}

Responde SOLO con este JSON, sin texto adicional:
{"name":"nombre en español","description":"1-2 frases en español","instructions":["paso 1","paso 2","paso 3","paso 4"]}`;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0.1, num_predict: 400 },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json() as { response: string };
  const parsed = JSON.parse(data.response);
  if (!parsed.name || !Array.isArray(parsed.instructions)) throw new Error('Invalid Ollama response');
  return parsed;
}

// ---- Main ----
async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Load existing exercise names to skip duplicates
    const { rows: existing } = await pool.query<{ name: string }>('SELECT name FROM exercises');
    const existingNames = new Set(existing.map(r => r.name.toLowerCase().trim()));
    console.log(`Existing exercises in DB: ${existingNames.size}`);

    let cursor: string | undefined;
    let page = 0;
    let inserted = 0;
    let skipped = 0;
    let failed = 0;
    let apiCalls = 0;

    console.log(`Fetching exercises from API...\n`);

    while (inserted < MAX) {
      const { exercises, nextCursor } = await fetchListPage(cursor);
      page++;
      apiCalls++;
      await sleep(300); // be gentle with rate limits

      for (const ex of exercises) {
        if (inserted >= MAX) break;

        // Skip if already exists
        if (existingNames.has(ex.name.toLowerCase().trim())) {
          skipped++;
          continue;
        }

        try {
          // Fetch detail for video + instructions
          const detail = await fetchDetail(ex.exerciseId);
          apiCalls++;
          await sleep(300);

          const muscleGroups = normalizeMuscles([
            ...(detail.targetMuscles ?? []),
            ...(detail.secondaryMuscles ?? []),
          ]);
          const equipment = normalizeEquipment(detail.equipments ?? []);
          const category = mapCategory(detail.exerciseType);
          const imageUrl = detail.imageUrls?.['480p'] ?? detail.imageUrl ?? null;
          const videoUrl = detail.videoUrl ?? null;
          const rawInstructions: string[] = detail.instructions ?? [];
          const rawDescription: string = detail.overview ?? '';

          if (DRY_RUN) {
            console.log(`  + ${ex.name} [${category}] img:${!!imageUrl} vid:${!!videoUrl} inst:${rawInstructions.length}`);
            inserted++;
            continue;
          }

          let finalName = ex.name;
          let finalDesc = rawDescription.slice(0, 500);
          let finalInstructions = rawInstructions.slice(0, 6);

          if (!SKIP_TRANSLATE && rawInstructions.length > 0) {
            try {
              const translated = await translateWithOllama(ex.name, rawDescription, rawInstructions);
              finalName = translated.name;
              finalDesc = translated.description;
              finalInstructions = translated.instructions;
            } catch (e) {
              console.log(`  [translate error: ${(e as Error).message} — keeping English]`);
            }
          }

          await pool.query(
            `INSERT INTO exercises (name, description, category, difficulty, muscle_groups, equipment, instructions, image_url, video_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT DO NOTHING`,
            [finalName, finalDesc, category, 'intermediate', muscleGroups, equipment, finalInstructions, imageUrl, videoUrl]
          );

          process.stdout.write(`  ✓ ${finalName}\n`);
          inserted++;
          existingNames.add(ex.name.toLowerCase().trim());

        } catch (err) {
          console.log(`  ✗ ${ex.name}: ${(err as Error).message}`);
          failed++;
          if ((err as Error).message.includes('Rate limit')) {
            console.log('Rate limit hit — stopping. Re-run to continue.');
            break;
          }
        }
      }

      if (!nextCursor || inserted >= MAX) break;
      cursor = nextCursor;
      console.log(`  [page ${page} done — ${inserted} inserted, ${apiCalls} API calls used]\n`);
    }

    console.log(`\nDone — inserted: ${inserted}, skipped: ${skipped}, failed: ${failed}, API calls: ${apiCalls}`);

  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
