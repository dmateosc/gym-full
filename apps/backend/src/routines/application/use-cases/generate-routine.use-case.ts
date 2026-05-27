import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';
import {
  ROUTINE_EXERCISE_REPOSITORY,
  RoutineExerciseRepositoryPort,
} from '../../domain/repositories/routine-exercise.repository.port';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../../exercises/domain/repositories/exercise.repository.port';
import { OllamaService } from '../../../shared/infrastructure/ollama/ollama.service';
import { GenerateRoutineDto } from '../../infrastructure/http/dto/generate-routine.dto';
import { ExerciseOrmEntity } from '../../../exercises/infrastructure/persistence/exercise.orm-entity';
import { ExerciseType } from '../../infrastructure/persistence/routine-exercise.orm-entity';
import { RoutineIntensity } from '../../infrastructure/persistence/daily-routine.orm-entity';

// Weekly muscle group schedule (0=Sunday ... 6=Saturday)
const WEEKLY_SCHEDULE: Record<number, { muscleGroups: string[]; goals: string[]; intensity: RoutineIntensity } | null> = {
  0: null, // Sunday — rest
  1: { muscleGroups: ['Pecho', 'Tríceps', 'Deltoides'], goals: ['fuerza', 'pecho', 'empuje'], intensity: RoutineIntensity.HIGH },
  2: { muscleGroups: ['Dorsales', 'Bíceps', 'Trapecios'], goals: ['fuerza', 'espalda', 'tirón'], intensity: RoutineIntensity.HIGH },
  3: { muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales', 'Gemelos'], goals: ['fuerza', 'piernas'], intensity: RoutineIntensity.HIGH },
  4: { muscleGroups: ['Pecho', 'Deltoides', 'Tríceps'], goals: ['hipertrofia', 'pecho', 'empuje'], intensity: RoutineIntensity.MODERATE },
  5: { muscleGroups: ['Dorsales', 'Bíceps', 'Romboides'], goals: ['hipertrofia', 'espalda', 'tirón'], intensity: RoutineIntensity.MODERATE },
  6: { muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], goals: ['fuerza', 'piernas', 'funcional'], intensity: RoutineIntensity.MODERATE },
};

interface OllamaExercise {
  exerciseId: string;
  order: number;
  exerciseType: string;
  sets?: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}

interface OllamaRoutine {
  name: string;
  description: string;
  intensity: string;
  estimatedDurationMinutes: number;
  estimatedCalories: number;
  goals: string[];
  warmUpNotes: string;
  coolDownNotes: string;
  exercises: OllamaExercise[];
}

@Injectable()
export class GenerateRoutineUseCase {
  private readonly logger = new Logger(GenerateRoutineUseCase.name);

  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
    @Inject(ROUTINE_EXERCISE_REPOSITORY)
    private readonly exerciseRoutineRepo: RoutineExerciseRepositoryPort,
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
    private readonly ollamaService: OllamaService,
  ) {}

  async execute(dto: GenerateRoutineDto) {
    const date = dto.date ?? new Date().toISOString().split('T')[0];

    const existing = await this.routineRepo.findByDate(date);
    if (existing) {
      this.logger.log(`Routine already exists for ${date}, returning existing`);
      return existing;
    }

    const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay();
    const schedule = WEEKLY_SCHEDULE[dayOfWeek];

    if (schedule === null) {
      this.logger.log(`${date} is Sunday — rest day, skipping generation`);
      return null;
    }

    const allExercises = await this.exerciseRepo.findAll();
    const targetMuscleGroups = dto.goals?.length ? dto.goals : schedule.muscleGroups;
    const intensity = dto.intensity ?? schedule.intensity;
    const goals = dto.goals ?? schedule.goals;

    // Filter exercises relevant to today's muscle groups (reduces prompt size ~4x)
    const relevantExercises = allExercises.filter((e) =>
      e.muscleGroups.some((mg) =>
        targetMuscleGroups.some((t) => mg.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(mg.toLowerCase())),
      ),
    );
    // Always include at least some exercises; fallback to strength category if filter is too narrow
    const exercises = relevantExercises.length >= 5 ? relevantExercises : allExercises.filter((e) => e.category === 'strength');

    this.logger.log(`Generating routine for ${date} (day ${dayOfWeek}) — muscles: ${targetMuscleGroups.join(', ')} — ${exercises.length} exercises available`);
    const prompt = this.buildPrompt(date, targetMuscleGroups, goals, intensity, exercises);

    const generated = await this.ollamaService.generateJson<OllamaRoutine>(prompt);

    this.validateGenerated(generated, allExercises);

    const routine = await this.routineRepo.create({
      name: generated.name,
      description: generated.description,
      routineDate: new Date(date),
      intensity: (generated.intensity as RoutineIntensity) ?? intensity,
      estimatedDurationMinutes: generated.estimatedDurationMinutes,
      estimatedCalories: generated.estimatedCalories,
      goals: generated.goals,
      warmUpNotes: generated.warmUpNotes,
      coolDownNotes: generated.coolDownNotes,
    });

    const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

    for (const ex of generated.exercises) {
      if (!exerciseMap.has(ex.exerciseId)) {
        this.logger.warn(`Ollama returned unknown exerciseId ${ex.exerciseId}, skipping`);
        continue;
      }
      await this.exerciseRoutineRepo.create({
        dailyRoutineId: routine.id,
        exerciseId: ex.exerciseId,
        orderInRoutine: ex.order,
        exerciseType: (ex.exerciseType as ExerciseType) ?? ExerciseType.SETS_REPS,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        durationSeconds: ex.durationSeconds,
        restSeconds: ex.restSeconds ?? 60,
        notes: ex.notes,
      });
    }

    this.logger.log(`Routine created id=${routine.id} for ${date}`);
    return this.routineRepo.findById(routine.id);
  }

  private buildPrompt(
    date: string,
    muscleGroups: string[],
    goals: string[],
    intensity: RoutineIntensity,
    exercises: ExerciseOrmEntity[],
  ): string {
    const exerciseList = exercises
      .map((e) => `{"id":"${e.id}","name":"${e.name}","muscleGroups":${JSON.stringify(e.muscleGroups)}}`)
      .join(',\n  ');

    return `Eres un entrenador personal profesional. Genera una rutina de gimnasio en JSON.

Ejercicios disponibles (usa los "id" exactos de esta lista):
[
  ${exerciseList}
]

Parámetros:
- Fecha: ${date}
- Grupos musculares objetivo: ${muscleGroups.join(', ')}
- Objetivos: ${goals.join(', ')}
- Intensidad: ${intensity}
- Incluye entre 6 y 8 ejercicios
- Usa exerciseType "sets_reps" para fuerza (con sets y reps realistas)
- Usa exerciseType "time_based" para cardio (con durationSeconds)
- restSeconds entre 60 y 90 para fuerza, 30-45 para cardio

Responde ÚNICAMENTE con este JSON (sin texto adicional):
{
  "name": "nombre corto de la rutina",
  "description": "descripción breve de 2 frases",
  "intensity": "${intensity}",
  "estimatedDurationMinutes": 60,
  "estimatedCalories": 400,
  "goals": ${JSON.stringify(goals)},
  "warmUpNotes": "calentamiento 5-10 min",
  "coolDownNotes": "estiramientos 5 min",
  "exercises": [
    {
      "exerciseId": "id-exacto-de-la-lista",
      "order": 1,
      "exerciseType": "sets_reps",
      "sets": 4,
      "reps": 10,
      "weight": null,
      "durationSeconds": null,
      "restSeconds": 75,
      "notes": null
    }
  ]
}`;
  }

  private validateGenerated(generated: OllamaRoutine, allExercises: ExerciseOrmEntity[]): void {
    if (!generated?.exercises?.length) {
      throw new BadRequestException('Ollama no generó ejercicios válidos');
    }
    const validIds = new Set(allExercises.map((e) => e.id));
    const validExercises = generated.exercises.filter((e) => validIds.has(e.exerciseId));
    if (validExercises.length === 0) {
      throw new BadRequestException('Ollama no devolvió IDs de ejercicios válidos');
    }
    generated.exercises = validExercises;
  }
}
