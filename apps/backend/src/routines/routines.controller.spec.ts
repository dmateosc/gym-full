import { Test, TestingModule } from '@nestjs/testing';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { CreateDailyRoutineDto } from './dto/create-daily-routine.dto';
import {
  RoutineIntensity,
  RoutineStatus,
} from './entities/daily-routine.entity';

describe('RoutinesController', () => {
  let controller: RoutinesController;

  const mockRoutinesService = {
    createDailyRoutine: jest.fn(),
    findAllDailyRoutines: jest.fn(),
    findDailyRoutineById: jest.fn(),
    findDailyRoutineByDate: jest.fn(),
    findTodayRoutine: jest.fn(),
    findUpcomingRoutines: jest.fn(),
    updateDailyRoutine: jest.fn(),
    deleteDailyRoutine: jest.fn(),
    startRoutine: jest.fn(),
    completeRoutine: jest.fn(),
    skipRoutine: jest.fn(),
    getRoutineStats: jest.fn(),
    getProgressStats: jest.fn(),
    findDailyRoutinesByDateRange: jest.fn(),
    getWeekRoutines: jest.fn(),
    getMonthRoutines: jest.fn(),
    addExerciseToRoutine: jest.fn(),
    updateRoutineExercise: jest.fn(),
    removeExerciseFromRoutine: jest.fn(),
    reorderRoutineExercises: jest.fn(),
  };

  const mockDailyRoutine = {
    id: '1',
    name: 'Test Routine',
    description: 'Test description',
    routineDate: new Date('2025-08-01'),
    intensity: RoutineIntensity.MODERATE,
    status: RoutineStatus.PLANNED,
    estimatedDurationMinutes: 60,
    estimatedCalories: 300,
    routineExercises: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutinesController],
      providers: [
        {
          provide: RoutinesService,
          useValue: mockRoutinesService,
        },
      ],
    }).compile();

    controller = module.get<RoutinesController>(RoutinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDailyRoutine', () => {
    it('should create a daily routine', async () => {
      const createDto: CreateDailyRoutineDto = {
        name: 'Test Routine',
        description: 'Test description',
        routineDate: '2025-08-01',
        intensity: RoutineIntensity.MODERATE,
        status: RoutineStatus.PLANNED,
        estimatedDurationMinutes: 60,
        estimatedCalories: 300,
      };

      mockRoutinesService.createDailyRoutine.mockResolvedValue(
        mockDailyRoutine,
      );

      const result = await controller.createDailyRoutine(createDto);

      expect(result).toEqual(mockDailyRoutine);
      expect(mockRoutinesService.createDailyRoutine).toHaveBeenCalledWith(
        createDto,
      );
    });
  });

  describe('findAllDailyRoutines', () => {
    it('should return all daily routines', async () => {
      const routines = [mockDailyRoutine];
      mockRoutinesService.findAllDailyRoutines.mockResolvedValue(routines);

      const result = await controller.findAllDailyRoutines();

      expect(result).toEqual(routines);
      expect(mockRoutinesService.findAllDailyRoutines).toHaveBeenCalled();
    });
  });

  describe('findDailyRoutineById', () => {
    it('should return a daily routine by ID', async () => {
      mockRoutinesService.findDailyRoutineById.mockResolvedValue(
        mockDailyRoutine,
      );

      const result = await controller.findDailyRoutineById('1');

      expect(result).toEqual(mockDailyRoutine);
      expect(mockRoutinesService.findDailyRoutineById).toHaveBeenCalledWith(
        '1',
      );
    });
  });

  describe('findDailyRoutineByDate', () => {
    it('should return a routine by date', async () => {
      mockRoutinesService.findDailyRoutineByDate.mockResolvedValue(
        mockDailyRoutine,
      );

      const result = await controller.findDailyRoutineByDate('2025-08-01');

      expect(result).toEqual(mockDailyRoutine);
      expect(mockRoutinesService.findDailyRoutineByDate).toHaveBeenCalledWith(
        '2025-08-01',
      );
    });
  });

  describe('findTodayRoutine', () => {
    it('should return today routine', async () => {
      mockRoutinesService.findTodayRoutine.mockResolvedValue(mockDailyRoutine);

      const result = await controller.findTodayRoutine();

      expect(result).toEqual(mockDailyRoutine);
      expect(mockRoutinesService.findTodayRoutine).toHaveBeenCalled();
    });
  });

  describe('startRoutine', () => {
    it('should start a routine', async () => {
      const startedRoutine = {
        ...mockDailyRoutine,
        status: RoutineStatus.IN_PROGRESS,
      };
      mockRoutinesService.startRoutine.mockResolvedValue(startedRoutine);

      const result = await controller.startRoutine('1');

      expect(result).toEqual(startedRoutine);
      expect(mockRoutinesService.startRoutine).toHaveBeenCalledWith('1');
    });
  });

  describe('completeRoutine', () => {
    it('should complete a routine', async () => {
      const completedRoutine = {
        ...mockDailyRoutine,
        status: RoutineStatus.COMPLETED,
      };
      mockRoutinesService.completeRoutine.mockResolvedValue(completedRoutine);

      const result = await controller.completeRoutine('1', {
        completionNotes: 'Great!',
      });

      expect(result).toEqual(completedRoutine);
      expect(mockRoutinesService.completeRoutine).toHaveBeenCalledWith(
        '1',
        'Great!',
      );
    });
  });

  describe('skipRoutine', () => {
    it('should skip a routine', async () => {
      const skippedRoutine = {
        ...mockDailyRoutine,
        status: RoutineStatus.SKIPPED,
      };
      mockRoutinesService.skipRoutine.mockResolvedValue(skippedRoutine);

      const result = await controller.skipRoutine('1', { reason: 'Too tired' });

      expect(result).toEqual(skippedRoutine);
      expect(mockRoutinesService.skipRoutine).toHaveBeenCalledWith(
        '1',
        'Too tired',
      );
    });
  });

  describe('getRoutineStats', () => {
    it('should return routine statistics', async () => {
      const stats = {
        totalExercises: 5,
        categories: ['strength', 'cardio'],
        totalEstimatedCalories: 300,
        totalEstimatedDuration: 60,
        intensityDistribution: RoutineIntensity.MODERATE,
        muscleGroups: ['chest', 'back'],
        status: RoutineStatus.PLANNED,
      };

      mockRoutinesService.getRoutineStats.mockResolvedValue(stats);

      const result = await controller.getRoutineStats('1');

      expect(result).toEqual(stats);
      expect(mockRoutinesService.getRoutineStats).toHaveBeenCalledWith('1');
    });
  });

  describe('getProgressStats', () => {
    it('should return progress statistics', async () => {
      const progressStats = {
        totalRoutines: 10,
        completedRoutines: 8,
        skippedRoutines: 1,
        completionRate: 80,
        totalCalories: 2400,
        totalDuration: 480,
        averageRoutineTime: 60,
      };

      mockRoutinesService.getProgressStats.mockResolvedValue(progressStats);

      const result = await controller.getProgressStats(
        '2025-08-01',
        '2025-08-31',
      );

      expect(result).toEqual(progressStats);
      expect(mockRoutinesService.getProgressStats).toHaveBeenCalledWith(
        '2025-08-01',
        '2025-08-31',
      );
    });
  });
});
