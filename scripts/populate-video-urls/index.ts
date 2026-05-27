import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');
const WGER_BASE = 'https://wger.de/api/v2';

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

const STOP_WORDS = new Set([
  'con', 'de', 'en', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'al',
  'with', 'the', 'a', 'an', 'for', 'and', 'or', 'of', 'in', 'on', 'at',
  'from', 'to', 'by', 'over', 'under', 'bar', 'using',
]);

interface WgerTranslation { name: string; language: number }
interface WgerExerciseInfo {
  images: { image: string; is_main: boolean }[];
  translations: WgerTranslation[];
}
interface WgerPage { count: number; next: string | null; results: WgerExerciseInfo[] }
interface DbExercise { id: string; name: string; image_url: string | null }

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

function score(queryTokens: string[], candidateTokens: string[]): number {
  if (queryTokens.length === 0 || candidateTokens.length === 0) return 0;
  const candidateSet = new Set(candidateTokens);
  const matches = queryTokens.filter(t => candidateSet.has(t)).length;
  // Recall: fraction of query words found in candidate (favours completeness)
  const recall = matches / queryTokens.length;
  // Precision: penalise candidates that add many unrelated words
  const precision = matches / candidateTokens.length;
  // F1
  return recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
}

async function fetchAllWgerExercises(): Promise<{ nameTokens: string[]; imageUrl: string }[]> {
  const entries: { nameTokens: string[]; imageUrl: string }[] = [];
  let url: string | null = `${WGER_BASE}/exerciseinfo/?format=json&limit=100`;
  let page = 1;

  while (url) {
    process.stdout.write(`\r  Fetching wger page ${page}...   `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`wger API error ${res.status}`);
    const data = await res.json() as WgerPage;

    for (const exercise of data.results) {
      const mainImage = exercise.images.find(i => i.is_main) ?? exercise.images[0];
      if (!mainImage) continue;

      for (const t of exercise.translations) {
        if (![2, 4].includes(t.language)) continue; // English or Spanish
        const tokens = tokenize(t.name);
        if (tokens.length > 0) {
          entries.push({ nameTokens: tokens, imageUrl: mainImage.image });
        }
      }
    }

    url = data.next;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\r  Done fetching wger catalog.         ');
  return entries;
}

function findBestMatch(
  exerciseName: string,
  catalog: { nameTokens: string[]; imageUrl: string }[],
  threshold = 0.35,
): { imageUrl: string; matchScore: number } | null {
  const queryTokens = tokenize(exerciseName);
  if (queryTokens.length === 0) return null;

  let best: { imageUrl: string; matchScore: number } | null = null;

  for (const entry of catalog) {
    const s = score(queryTokens, entry.nameTokens);
    if (s >= threshold && (!best || s > best.matchScore)) {
      best = { imageUrl: entry.imageUrl, matchScore: s };
    }
  }

  return best;
}

async function main() {
  console.log('Fetching wger exercise catalog...');
  const catalog = await fetchAllWgerExercises();
  console.log(`Built catalog: ${catalog.length} entries with images\n`);

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const sql = ALL
      ? 'SELECT id, name, image_url FROM exercises ORDER BY name'
      : 'SELECT id, name, image_url FROM exercises WHERE image_url IS NULL ORDER BY name';

    const { rows: exercises } = await pool.query<DbExercise>(sql);
    console.log(`Processing ${exercises.length} exercises...\n`);

    let updated = 0;
    let skipped = 0;

    for (const exercise of exercises) {
      const match = findBestMatch(exercise.name, catalog);

      if (!match) {
        console.log(`  ✗ ${exercise.name}`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  ✓ ${exercise.name} (score: ${match.matchScore.toFixed(2)})\n    ${match.imageUrl}`);
      } else {
        await pool.query('UPDATE exercises SET image_url = $1 WHERE id = $2', [match.imageUrl, exercise.id]);
        console.log(`  ✓ ${exercise.name} (score: ${match.matchScore.toFixed(2)})`);
        updated++;
      }
    }

    console.log(`\nDone — updated: ${updated}, unmatched: ${skipped}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
