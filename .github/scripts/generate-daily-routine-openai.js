import OpenAI from "openai";
import pg from "pg";
const { Client } = pg;

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuración de PostgreSQL
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Función para inicializar la conexión
async function initializeDatabase() {
  console.log('🔌 Conectando a la base de datos...');
  try {
    await dbClient.connect();
    console.log('✅ Conexión a la base de datos establecida');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

// Grupos musculares por día de la semana (usando nombres exactos de la DB)
const MUSCLE_GROUPS_SCHEDULE = {
  Monday: ["Pecho", "Tríceps", "Deltoides"],
  Tuesday: ["Dorsales", "Bíceps"],
  Wednesday: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
  Thursday: ["Pecho", "Deltoides", "Tríceps"],
  Friday: ["Dorsales", "Bíceps"],
  Saturday: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
  Sunday: "rest" // Día de descanso
};

// Función para obtener ejercicios de la base de datos
async function getExercisesByMuscleGroups(muscleGroups) {
  try {
    const query = `
      SELECT * FROM exercises 
      WHERE category = 'strength' 
        AND muscle_groups && $1
      ORDER BY RANDOM()
      LIMIT 10
    `;
    
    const result = await dbClient.query(query, [muscleGroups]);
    return result.rows;
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Función para verificar si ya existe una rutina para una fecha específica
async function routineExistsForDate(date) {
  try {
    const query = `
      SELECT id FROM daily_routines 
      WHERE routine_date = $1 
      LIMIT 1
    `;
    
    const result = await dbClient.query(query, [date]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking routine:', error);
    return false;
  }
}

// Función para generar rutina con OpenAI
async function generateRoutineWithAI(day, muscleGroups, availableExercises) {
  const exerciseList = availableExercises.map(ex => 
    `- ID: ${ex.id}, Nombre: ${ex.name}, Descripción: ${ex.description}, Dificultad: ${ex.difficulty}`
  ).join('\n');

  const prompt = `Como entrenador personal experto, crea una rutina de fuerza para ${day} enfocada en ${muscleGroups.join(', ')}.

Ejercicios disponibles:
${exerciseList}

Requisitos:
1. Selecciona exactamente 6 ejercicios de la lista usando sus IDs
2. Crea una rutina progresiva y balanceada
3. Incluye calentamiento y enfriamiento específicos
4. Asigna series (3-4), repeticiones (8-15) y peso sugerido (10-50kg)
5. Duración estimada: 45-75 minutos
6. Calorías estimadas: 300-600
7. Descansos entre series: 60-120 segundos

Responde SOLO en formato JSON válido (sin texto adicional):
{
  "name": "Rutina de [Grupos Musculares] - ${day}",
  "description": "Descripción motivacional de la rutina de máximo 150 caracteres",
  "intensity": "moderate",
  "estimatedDurationMinutes": 60,
  "estimatedCalories": 450,
  "goals": ["strength", "muscle_building"],
  "warmUpNotes": "Instrucciones específicas de calentamiento para ${muscleGroups.join(', ')}",
  "coolDownNotes": "Instrucciones específicas de enfriamiento y estiramiento",
  "exercises": [
    {
      "exerciseId": "usar_id_exacto_de_la_lista",
      "orderInRoutine": 1,
      "sets": 3,
      "reps": 12,
      "weight": 20,
      "restSeconds": 90,
      "notes": "Notas técnicas específicas para este ejercicio"
    }
  ]
}`;

  try {
    console.log('🤖 Enviando prompt a OpenAI GPT-4o...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Usar modelo más económico
      messages: [
        {
          role: "system",
          content: "Eres un entrenador personal experto. Responde únicamente en JSON válido, sin texto adicional antes o después."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const content = response.choices[0].message.content.trim();
    console.log('✅ Respuesta recibida de OpenAI');
    
    // Limpiar la respuesta en caso de que tenga markdown
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    const routineData = JSON.parse(cleanContent);
    console.log(`✅ Rutina generada: "${routineData.name}" con ${routineData.exercises.length} ejercicios`);
    
    return routineData;
  } catch (error) {
    console.error('❌ Error generating routine with AI:', error);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return null;
  }
}

// Función para crear rutina en la base de datos
async function createRoutineInDatabase(routineData, date) {
  try {
    // 1. Crear la rutina principal
    const insertRoutineQuery = `
      INSERT INTO daily_routines (
        name, description, routine_date, intensity, 
        estimated_duration_minutes, estimated_calories, goals, 
        warm_up_notes, cool_down_notes, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name
    `;
    
    const routineResult = await dbClient.query(insertRoutineQuery, [
      routineData.name,
      routineData.description,
      date,
      routineData.intensity,
      routineData.estimatedDurationMinutes,
      routineData.estimatedCalories,
      routineData.goals,
      routineData.warmUpNotes,
      routineData.coolDownNotes,
      'planned'
    ]);

    const routine = routineResult.rows[0];
    console.log(`✅ Rutina principal creada: ${routine.name}`);

    // 2. Crear los ejercicios de la rutina
    if (routineData.exercises && routineData.exercises.length > 0) {
      const insertExerciseQuery = `
        INSERT INTO routine_exercises (
          daily_routine_id, exercise_id, order_in_routine, 
          exercise_type, sets, reps, weight, rest_seconds, 
          notes, intensity
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      let exercisesCreated = 0;
      for (const exercise of routineData.exercises) {
        try {
          await dbClient.query(insertExerciseQuery, [
            routine.id,
            exercise.exerciseId,
            exercise.orderInRoutine,
            'sets_reps',
            exercise.sets,
            exercise.reps,
            exercise.weight,
            exercise.restSeconds,
            exercise.notes,
            'moderate'
          ]);
          exercisesCreated++;
        } catch (exerciseError) {
          console.error(`⚠️  Error creando ejercicio ${exercise.orderInRoutine}:`, exerciseError.message);
        }
      }
      
      console.log(`✅ ${exercisesCreated}/${routineData.exercises.length} ejercicios creados`);
    }

    console.log(`✅ Rutina completa creada para ${date}: ${routine.name}`);
    return true;
  } catch (error) {
    console.error('❌ Error creating routine:', error);
    return false;
  }
}

// Función principal - Generar rutina para mañana
async function generateTomorrowRoutine() {
  console.log('🚀 Iniciando generación de rutina para mañana con OpenAI...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // Rutina para mañana
  
  const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = tomorrow.toISOString().split('T')[0];

  console.log(`📅 Generando rutina para ${dayName} (${dateString})`);

  // Verificar si ya existe una rutina para esta fecha
  const routineExists = await routineExistsForDate(dateString);
  
  if (routineExists) {
    console.log(`⏭️  Ya existe una rutina para ${dateString}, terminando...`);
    return { created: 0, skipped: 1 };
  }

  // Día de descanso
  if (MUSCLE_GROUPS_SCHEDULE[dayName] === 'rest') {
    console.log(`😴 ${dayName} es día de descanso, no se crea rutina`);
    return { created: 0, skipped: 1 };
  }

  const muscleGroups = MUSCLE_GROUPS_SCHEDULE[dayName];
  console.log(`💪 Grupos musculares: ${muscleGroups.join(', ')}`);

  // Obtener ejercicios disponibles
  console.log('🔍 Buscando ejercicios disponibles...');
  const availableExercises = await getExercisesByMuscleGroups(muscleGroups);
  if (availableExercises.length === 0) {
    console.log(`❌ No se encontraron ejercicios para ${muscleGroups.join(', ')}`);
    return { created: 0, skipped: 1 };
  }

  console.log(`📋 Encontrados ${availableExercises.length} ejercicios disponibles`);

  // Generar rutina con OpenAI
  console.log(`🤖 Generando rutina con OpenAI...`);
  const routineData = await generateRoutineWithAI(dayName, muscleGroups, availableExercises);
  
  if (!routineData) {
    console.log(`❌ Error generando rutina para ${dayName}`);
    return { created: 0, skipped: 1 };
  }

  // Crear rutina en base de datos
  console.log(`💾 Guardando rutina en base de datos...`);
  const success = await createRoutineInDatabase(routineData, dateString);
  
  const result = success ? { created: 1, skipped: 0 } : { created: 0, skipped: 1 };
  
  console.log(`📊 Resultado: ${result.created} creada, ${result.skipped} saltada`);
  
  // Cerrar conexión de la base de datos
  await dbClient.end();
  console.log('🔌 Conexión de base de datos cerrada');

  return result;
}

// Ejecutar si es llamado directamente
console.log('🎯 Generador de rutinas diarias con OpenAI');
console.log('📍 Script iniciado...');

async function main() {
  console.log('🔄 Ejecutando función main...');
  const dbConnected = await initializeDatabase();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  try {
    const result = await generateTomorrowRoutine();
    console.log('✅ Script ejecutado exitosamente:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
    await dbClient.end().catch(() => {});
    process.exit(1);
  }
}

main();

export { generateTomorrowRoutine };
