import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');

const FEDB_JSON = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FEDB_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

interface FeDbExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

const CATEGORY_MAP: Record<string, string> = {
  strength: 'strength',
  cardio: 'cardio',
  stretching: 'flexibility',
  plyometrics: 'functional',
  powerlifting: 'strength',
  strongman: 'strength',
  'olympic weightlifting': 'strength',
};

const LEVEL_MAP: Record<string, string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  expert: 'advanced',
};

function mapCategory(cat: string): string {
  return CATEGORY_MAP[cat.toLowerCase()] ?? 'strength';
}

function mapDifficulty(level: string): string {
  return LEVEL_MAP[level.toLowerCase()] ?? 'intermediate';
}

function mapEquipment(equipment: string | null): string[] {
  if (!equipment || equipment === 'body only') return ['body'];
  return [equipment];
}

async function main() {
  process.stdout.write('Fetching free-exercise-db... ');
  const res = await fetch(FEDB_JSON);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const catalog = await res.json() as FeDbExercise[];
  console.log(`${catalog.length} exercises loaded`);

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  });

  try {
    const { rows: existing } = await pool.query<{ name: string }>(
      'SELECT name FROM exercises'
    );
    const existingNames = new Set(existing.map(r => r.name.toLowerCase().trim()));
    console.log(`Existing in DB: ${existingNames.size}\n`);

    const toInsert = catalog.filter(e => !existingNames.has(e.name.toLowerCase().trim()));
    console.log(`New exercises to import: ${toInsert.length}\n`);

    let inserted = 0;
    let failed = 0;

    for (const ex of toInsert) {
      const category = mapCategory(ex.category);
      const difficulty = mapDifficulty(ex.level);
      const muscleGroups = [...new Set([...ex.primaryMuscles, ...ex.secondaryMuscles])];
      const equipment = mapEquipment(ex.equipment);
      const imageUrl = ex.images.length > 0 ? `${FEDB_IMG}/${ex.images[0]}` : null;

      if (DRY_RUN) {
        console.log(`  + ${ex.name} [${category}/${difficulty}] muscles: ${muscleGroups.join(', ')}`);
        inserted++;
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO exercises (name, description, category, difficulty, muscle_groups, equipment, instructions, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            ex.name,
            null,
            category,
            difficulty,
            muscleGroups,
            equipment,
            ex.instructions,
            imageUrl,
          ]
        );
        process.stdout.write('.');
        inserted++;
      } catch (err) {
        console.error(`\n  ERROR ${ex.name}: ${(err as Error).message}`);
        failed++;
      }
    }

    console.log(`\n\nDone — inserted: ${inserted}, failed: ${failed}`);
    console.log(`Total in DB: ${existingNames.size + inserted}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
