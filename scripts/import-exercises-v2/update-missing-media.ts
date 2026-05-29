import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const API_BASE = `https://${RAPIDAPI_HOST}/api/v1`;

if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }
if (!RAPIDAPI_KEY) { console.error('Missing RAPIDAPI_KEY'); process.exit(1); }

const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': RAPIDAPI_HOST,
  'x-rapidapi-key': RAPIDAPI_KEY!,
};

function normalize(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(name: string): Set<string> {
  const stopWords = new Set(['con', 'de', 'en', 'el', 'la', 'los', 'las', 'y', 'o', 'with', 'the', 'a', 'for', 'and', 'or', 'of']);
  return new Set(normalize(name).split(' ').filter(w => w.length > 2 && !stopWords.has(w)));
}

function similarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (!ta.size || !tb.size) return 0;
  const matches = [...ta].filter(t => tb.has(t)).length;
  return (2 * matches) / (ta.size + tb.size);
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllExercises(): Promise<{ exerciseId: string; name: string }[]> {
  const all: { exerciseId: string; name: string }[] = [];
  let cursor: string | undefined;

  process.stdout.write('Fetching API exercise list...');
  while (true) {
    const url = `${API_BASE}/exercises?limit=25` + (cursor ? `&cursor=${cursor}` : '');
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
    if (res.status === 429) throw new Error('Rate limit exceeded');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as any;
    all.push(...data.data.map((e: any) => ({ exerciseId: e.exerciseId, name: e.name })));
    process.stdout.write('.');
    if (!data.meta.hasNextPage) break;
    cursor = data.meta.nextCursor;
    await sleep(300);
  }
  console.log(` ${all.length} exercises`);
  return all;
}

async function fetchDetail(exerciseId: string): Promise<{ imageUrl: string | null; videoUrl: string | null }> {
  const res = await fetch(`${API_BASE}/exercises/${exerciseId}`, { headers, signal: AbortSignal.timeout(30_000) });
  if (res.status === 429) throw new Error('Rate limit exceeded');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as any;
  return {
    imageUrl: data.data.imageUrls?.['480p'] ?? data.data.imageUrl ?? null,
    videoUrl: data.data.videoUrl ?? null,
  };
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  });

  try {
    const { rows: missing } = await pool.query<{ id: string; name: string }>(
      `SELECT id, name FROM exercises WHERE video_url IS NULL OR image_url IS NULL ORDER BY name`
    );
    console.log(`Exercises missing media: ${missing.length}\n`);

    const catalog = await fetchAllExercises();

    let updated = 0;
    let unmatched = 0;

    for (const ex of missing) {
      const best = catalog.reduce<{ exerciseId: string; name: string; score: number }>((acc, c) => {
        const s = similarity(ex.name, c.name);
        return s > acc.score ? { ...c, score: s } : acc;
      }, { exerciseId: '', name: '', score: 0 });

      if (best.score < 0.35) {
        console.log(`  ✗ ${ex.name} (no match)`);
        unmatched++;
        continue;
      }

      try {
        const { imageUrl, videoUrl } = await fetchDetail(best.exerciseId);
        await sleep(300);

        if (DRY_RUN) {
          console.log(`  ✓ ${ex.name} → ${best.name} (${best.score.toFixed(2)}) img:${!!imageUrl} vid:${!!videoUrl}`);
        } else {
          await pool.query(
            `UPDATE exercises SET
               image_url = COALESCE(image_url, $1),
               video_url = COALESCE(video_url, $2)
             WHERE id = $3`,
            [imageUrl, videoUrl, ex.id]
          );
          console.log(`  ✓ ${ex.name} → ${best.name} (${best.score.toFixed(2)})`);
        }
        updated++;
      } catch (err) {
        console.log(`  ✗ ${ex.name}: ${(err as Error).message}`);
        if ((err as Error).message.includes('Rate limit')) break;
      }
    }

    console.log(`\nDone — updated: ${updated}, unmatched: ${unmatched}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
