"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
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
// Heuristic: name is already in Spanish if it has Spanish words or no English keywords
function looksEnglish(name) {
    const englishWords = /\b(barbell|dumbbell|bench|press|row|squat|deadlift|curl|plank|crunch|lunge|thrust|flip|snatch|clean|hang|swing|pull|push|raise|fly|flies|overhead|incline|decline|grip|wide|narrow|single|double|cable|rope|band|machine|twist|kick|jump|run|hop|step|tire|power|hang|high|side|russian|romanian|hammer|spider|zottman)\b/i;
    return englishWords.test(name);
}
async function callOllama(exercise) {
    const prompt = `Eres un entrenador personal experto en terminología de gimnasio en español. Tu tarea es asignar el nombre oficial en español de un ejercicio y escribir sus instrucciones.

REGLAS ESTRICTAS para el nombre:
- Usa la terminología estándar de gimnasio en español, NO traduzcas palabra por palabra.
- Mantén los términos técnicos reconocidos: "Peso muerto", "Remo", "Press", "Curl", "Sentadilla", "Fondos", "Plancha", "Zancada", "Hip thrust", "Clean", "Snatch", "Swing".
- Indica el equipamiento solo si es relevante: "con Barra", "con Mancuernas", "en Polea", "en Máquina".
- Indica variantes con términos precisos: "Agarre Cerrado", "Agarre Ancho", "Inclinado", "Declinado", "Unilateral".
- NO inventes nombres creativos ni traduzcas literalmente. Si no sabes el nombre oficial, mantenlo en inglés.

EJEMPLOS CORRECTOS:
- "Barbell Deadlift" → "Peso Muerto con Barra"
- "Bent Over Barbell Row" → "Remo con Barra"
- "Dumbbell Flyes" → "Aperturas con Mancuernas"
- "Hang Clean" → "Cargada Colgante"
- "Romanian Deadlift" → "Peso Muerto Rumano"
- "Tire flip" → "Volteo de Neumático"
- "Landmine twist" → "Rotación con Barra Fija"
- "Power snatch" → "Arrancada de Potencia"
- "Jumping rope" → "Salto a la Comba"
- "Shoulder Press" → "Press de Hombros"

Ejercicio a procesar:
Nombre original: ${exercise.name}
Categoría: ${exercise.category}
Músculos: ${exercise.muscle_groups.join(', ')}
Equipamiento: ${exercise.equipment.join(', ')}

Responde SOLO con JSON válido, sin texto adicional:
{
  "name": "nombre oficial en español",
  "description": "descripción de 1-2 frases qué músculos trabaja y para qué sirve",
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
            options: { temperature: 0.4, num_predict: 512 },
        }),
        signal: AbortSignal.timeout(120000),
    });
    if (!res.ok)
        throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return JSON.parse(data.response);
}
async function main() {
    const pool = new pg_1.Pool({ connectionString: DATABASE_URL, ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false });
    try {
        // Select exercises that look English (or all if --all)
        const { rows: exercises } = await pool.query('SELECT id, name, description, instructions, category, muscle_groups, equipment FROM exercises ORDER BY name');
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
                }
                else {
                    await pool.query('UPDATE exercises SET name = $1, description = $2, instructions = $3 WHERE id = $4', [newName, newDesc, result.instructions, exercise.id]);
                    console.log(` → ${newName}`);
                    updated++;
                }
            }
            catch (err) {
                console.log(` ERROR: ${err.message}`);
                failed++;
            }
        }
        console.log(`\nDone — updated: ${updated}, failed: ${failed}`);
    }
    finally {
        await pool.end();
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
