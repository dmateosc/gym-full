import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreateExerciseUseCase } from '../exercises/application/use-cases/create-exercise.use-case';
import {
  ExerciseCategory,
  Difficulty,
} from '../exercises/infrastructure/persistence/exercise.orm-entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const exercisesService = app.get(CreateExerciseUseCase);

  // Datos de ejemplo para poblar la base de datos
  const exercisesData = [
    {
      name: 'Push-ups',
      description: 'Ejercicio clásico de fuerza para el tren superior',
      category: ExerciseCategory.STRENGTH,
      difficulty: Difficulty.BEGINNER,
      muscleGroups: ['Pecho', 'Tríceps', 'Hombros'],
      equipment: ['Peso corporal'],
      instructions: [
        'Colócate en posición de plancha con las manos en el suelo',
        'Baja el cuerpo hasta que el pecho casi toque el suelo',
        'Empuja hacia arriba hasta la posición inicial',
        'Mantén el cuerpo en línea recta durante todo el movimiento',
      ],
      estimatedDuration: 15,
      calories: 100,
    },
    {
      name: 'Squats',
      description: 'Ejercicio fundamental para fortalecer las piernas',
      category: ExerciseCategory.STRENGTH,
      difficulty: Difficulty.BEGINNER,
      muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'],
      equipment: ['Peso corporal'],
      instructions: [
        'Párate con los pies separados al ancho de los hombros',
        'Baja como si fueras a sentarte en una silla',
        'Mantén el peso en los talones',
        'Regresa a la posición inicial',
      ],
      estimatedDuration: 20,
      calories: 150,
    },
    {
      name: 'Running',
      description: 'Ejercicio cardiovascular básico',
      category: ExerciseCategory.CARDIO,
      difficulty: Difficulty.INTERMEDIATE,
      muscleGroups: ['Piernas', 'Core'],
      equipment: ['Zapatillas deportivas'],
      instructions: [
        'Calienta con una caminata de 5 minutos',
        'Comienza a trotar a un ritmo cómodo',
        'Mantén una postura erguida',
        'Termina con una caminata de enfriamiento',
      ],
      estimatedDuration: 30,
      calories: 300,
    },
    {
      name: 'Plancha',
      description: 'Ejercicio isométrico para fortalecer el core',
      category: ExerciseCategory.STRENGTH,
      difficulty: Difficulty.BEGINNER,
      muscleGroups: ['Core', 'Hombros', 'Espalda'],
      equipment: ['Peso corporal'],
      instructions: [
        'Colócate en posición de plancha sobre los antebrazos',
        'Mantén el cuerpo en línea recta',
        'Contrae los músculos del core',
        'Mantén la posición durante el tiempo indicado',
      ],
      estimatedDuration: 10,
      calories: 50,
    },
    {
      name: 'Yoga Flow',
      description: 'Secuencia de yoga para flexibilidad',
      category: ExerciseCategory.FLEXIBILITY,
      difficulty: Difficulty.INTERMEDIATE,
      muscleGroups: ['Todo el cuerpo'],
      equipment: ['Esterilla de yoga'],
      instructions: [
        'Comienza en posición de montaña',
        'Fluye a través de las posturas básicas',
        'Mantén la respiración profunda',
        'Termina en savasana',
      ],
      estimatedDuration: 25,
      calories: 80,
    },
  ];

  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    for (const exerciseData of exercisesData) {
      await exercisesService.execute(exerciseData as any);
      console.log(`✅ Ejercicio creado: ${exerciseData.name}`);
    }

    console.log('🎉 Seeding completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await app.close();
  }
}

void seed();
