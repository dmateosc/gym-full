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

    const exercises = await this.exerciseRepo.findAll();
    const prompt = this.buildPrompt(date, dto, exercises);

    this.logger.log(`Generating routine for ${date} via Ollama`);
    const generated = await this.ollamaService.generateJson<OllamaRoutine>(prompt);

    this.validateGenerated(generated, exercises);

    const routine = await this.routineRepo.create({
      name: generated.name,
      description: generated.description,
      routineDate: new Date(date),
      intensity: (generated.intensity as RoutineIntensity) ?? RoutineIntensity.MODERATE,
      estimatedDurationMinutes: generated.estimatedDurationMinutes,
      estimatedCalories: generated.estimatedCalories,
      goals: generated.goals,
      warmUpNotes: generated.warmUpNotes,
      coolDownNotes: generated.coolDownNotes,
    });

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

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

    this.logger.log(`Routine created with id=${routine.id} for ${date}`);
    return this.routineRepo.findById(routine.id);
  }

  private buildPrompt(
    date: string,
    dto: GenerateRoutineDto,
    exercises: ExerciseOrmEntity[],
  ): string {
    const intensity = dto.intensity ?? 'moderate';
    const goals = dto.goals?.join(', ') ?? 'strength, cardio';

    const exerciseList = exercises
      .map(
        (e) =>
          `{"id":"${e.id}","name":"${e.name}","category":"${e.category}","difficulty":"${e.difficulty}","muscleGroups":${JSON.stringify(e.muscleGroups)}}`,
      )
      .join(',\n  ');

    return `You are a professional fitness trainer. Generate a daily workout routine for a gym.

Available exercises (you MUST use the exact "id" values from this list):
[
  ${exerciseList}
]

Parameters:
- Date: ${date}
- Intensity: ${intensity}
- Goals: ${goals}
- Include 6 to 9 exercises
- Balance muscle groups (avoid working same muscles twice)
- For strength exercises use exerciseType "sets_reps" with sets and reps
- For cardio use exerciseType "time_based" with durationSeconds
- Include realistic sets, reps, restSeconds values

Respond ONLY with a JSON object matching this exact structure (no extra text):
{
  "name": "short routine name in Spanish",
  "description": "2-3 sentence description in Spanish",
  "intensity": "${intensity}",
  "estimatedDurationMinutes": 60,
  "estimatedCalories": 400,
  "goals": ["strength", "cardio"],
  "warmUpNotes": "warm up description in Spanish",
  "coolDownNotes": "cool down description in Spanish",
  "exercises": [
    {
      "exerciseId": "exact-id-from-list-above",
      "order": 1,
      "exerciseType": "sets_reps",
      "sets": 3,
      "reps": 12,
      "weight": null,
      "durationSeconds": null,
      "restSeconds": 60,
      "notes": null
    }
  ]
}`;
  }

  private validateGenerated(generated: OllamaRoutine, exercises: ExerciseOrmEntity[]): void {
    if (!generated?.exercises?.length) {
      throw new BadRequestException('Ollama no generó ejercicios válidos');
    }
    const validIds = new Set(exercises.map((e) => e.id));
    const validExercises = generated.exercises.filter((e) => validIds.has(e.exerciseId));
    if (validExercises.length === 0) {
      throw new BadRequestException('Ollama no devolvió IDs de ejercicios válidos');
    }
    generated.exercises = validExercises;
  }
}
