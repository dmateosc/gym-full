import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');

const FEDB_JSON = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FEDB_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

const STOP_WORDS = new Set([
  'con', 'de', 'en', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'al',
  'with', 'the', 'a', 'an', 'for', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'by',
]);

interface FeDbExercise {
  id: string;
  name: string;
  images: string[];
}

interface DbExercise {
  id: string;
  name: string;
  image_url: string | null;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(name: string): string[] {
  return normalize(name).split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function f1Score(queryTokens: string[], candidateTokens: string[]): number {
  if (!queryTokens.length || !candidateTokens.length) return 0;
  const candidateSet = new Set(candidateTokens);
  const matches = queryTokens.filter(t => candidateSet.has(t)).length;
  const recall = matches / queryTokens.length;
  const precision = matches / candidateTokens.length;
  return recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
}

async function fetchCatalog(): Promise<{ tokens: string[]; imageUrl: string }[]> {
  process.stdout.write('Fetching free-exercise-db catalog... ');
  const res = await fetch(FEDB_JSON);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as FeDbExercise[];
  console.log(`${data.length} exercises loaded`);

  return data
    .filter(e => e.images.length > 0)
    .map(e => ({
      tokens: tokenize(e.name),
      imageUrl: `${FEDB_IMG}/${e.images[0]}`,
    }));
}

function findBestMatch(
  name: string,
  catalog: { tokens: string[]; imageUrl: string }[],
  threshold = 0.4,
): { imageUrl: string; score: number } | null {
  const query = tokenize(name);
  if (!query.length) return null;

  let best: { imageUrl: string; score: number } | null = null;
  for (const entry of catalog) {
    const s = f1Score(query, entry.tokens);
    if (s >= threshold && (!best || s > best.score)) {
      best = { imageUrl: entry.imageUrl, score: s };
    }
  }
  return best;
}

async function main() {
  const catalog = await fetchCatalog();
  console.log(`Index built: ${catalog.length} entries with images\n`);

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  });

  try {
    const sql = ALL
      ? 'SELECT id, name, image_url FROM exercises ORDER BY name'
      : 'SELECT id, name, image_url FROM exercises WHERE image_url IS NULL ORDER BY name';

    const { rows } = await pool.query<DbExercise>(sql);
    console.log(`Processing ${rows.length} exercises...\n`);

    let updated = 0;
    let skipped = 0;

    for (const exercise of rows) {
      const match = findBestMatch(exercise.name, catalog);

      if (!match) {
        console.log(`  ✗ ${exercise.name}`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  ✓ ${exercise.name} (${match.score.toFixed(2)})\n    ${match.imageUrl}`);
      } else {
        await pool.query('UPDATE exercises SET image_url = $1 WHERE id = $2', [match.imageUrl, exercise.id]);
        console.log(`  ✓ ${exercise.name} (${match.score.toFixed(2)})`);
        updated++;
      }
    }

    console.log(`\nDone — updated: ${updated}, unmatched: ${skipped}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
