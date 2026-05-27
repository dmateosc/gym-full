import { Pool } from 'pg';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');
// Process only exercises without a video_url by default; --all overrides
const ALL = process.argv.includes('--all');

if (!YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY env var');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

interface Exercise {
  id: string;
  name: string;
  video_url: string | null;
}

async function searchYouTube(exerciseName: string): Promise<string | null> {
  const query = encodeURIComponent(`${exerciseName} ejercicio técnica correcta`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&relevanceLanguage=es&key=${YOUTUBE_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }

  const data = await res.json() as { items?: { id: { videoId: string } }[] };
  const videoId = data.items?.[0]?.id?.videoId;
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const query = ALL
      ? 'SELECT id, name, video_url FROM exercises ORDER BY name'
      : 'SELECT id, name, video_url FROM exercises WHERE video_url IS NULL ORDER BY name';

    const { rows: exercises } = await pool.query<Exercise>(query);
    console.log(`Found ${exercises.length} exercises to process\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const exercise of exercises) {
      process.stdout.write(`  ${exercise.name} ... `);

      try {
        const videoUrl = await searchYouTube(exercise.name);

        if (!videoUrl) {
          console.log('no results');
          skipped++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`[dry-run] ${videoUrl}`);
        } else {
          await pool.query('UPDATE exercises SET video_url = $1 WHERE id = $2', [videoUrl, exercise.id]);
          console.log(videoUrl);
          updated++;
        }

        // Avoid hitting YouTube quota (100 units/search, 10,000 units/day free)
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.log(`ERROR: ${(err as Error).message}`);
        failed++;
      }
    }

    console.log(`\nDone — updated: ${updated}, skipped: ${skipped}, failed: ${failed}`);
  } finally {
    await pool.end();
  }
}

main();
