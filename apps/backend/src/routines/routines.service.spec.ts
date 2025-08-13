import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import {
  DailyRoutine,
  RoutineIntensity,
  RoutineStatus,
} from './entities/daily-routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { CreateDailyRoutineDto } from './dto/create-daily-routine.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RoutinesService', () => {
  let service: RoutinesService;

  const mockDailyRoutine: Partial<DailyRoutine> = {
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

  const mockDailyRoutineRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoutineExerciseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutinesService,
        {
          provide: getRepositoryToken(DailyRoutine),
          useValue: mockDailyRoutineRepository,
        },
        {
          provide: getRepositoryToken(RoutineExercise),
          useValue: mockRoutineExerciseRepository,
        },
      ],
    }).compile();

    service = module.get<RoutinesService>(RoutinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDailyRoutine', () => {
    it('should create a daily routine successfully', async () => {
      const createDto = {
        name: 'Test Routine',
        description: 'Test description',
        routineDate: '2025-08-01',
        intensity: RoutineIntensity.MODERATE,
        status: RoutineStatus.PLANNED,
        estimatedDurationMinutes: 60,
        estimatedCalories: 300,
      };

      mockDailyRoutineRepository.findOne.mockResolvedValue(null);
      mockDailyRoutineRepository.create.mockReturnValue(mockDailyRoutine);
      mockDailyRoutineRepository.save.mockResolvedValue(mockDailyRoutine);

      const result = await service.createDailyRoutine(createDto);

      expect(result).toEqual(mockDailyRoutine);
      expect(mockDailyRoutineRepository.findOne).toHaveBeenCalledWith({
        where: { routineDate: new Date('2025-08-01') },
      });
      expect(mockDailyRoutineRepository.create).toHaveBeenCalledWith({
        ...createDto,
        routineDate: new Date('2025-08-01'),
      });
      expect(mockDailyRoutineRepository.save).toHaveBeenCalledWith(
        mockDailyRoutine,
      );
    });

    it('should throw BadRequestException if routine already exists for date', async () => {
      const createDto = {
        name: 'Test Routine',
        routineDate: '2025-08-01',
      };

      mockDailyRoutineRepository.findOne.mockResolvedValue(mockDailyRoutine);

      await expect(
        service.createDailyRoutine(createDto as CreateDailyRoutineDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findDailyRoutineById', () => {
    it('should find a routine by ID', async () => {
      mockDailyRoutineRepository.findOne.mockResolvedValue(mockDailyRoutine);

      const result = await service.findDailyRoutineById('1');

      expect(result).toEqual(mockDailyRoutine);
      expect(mockDailyRoutineRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['routineExercises', 'routineExercises.exercise'],
      });
    });

    it('should throw NotFoundException if routine not found', async () => {
      mockDailyRoutineRepository.findOne.mockResolvedValue(null);

      await expect(service.findDailyRoutineById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startRoutine', () => {
    it('should start a routine successfully', async () => {
      const routineToStart = {
        ...mockDailyRoutine,
        status: RoutineStatus.PLANNED,
      };

      mockDailyRoutineRepository.findOne.mockResolvedValue(routineToStart);
      mockDailyRoutineRepository.save.mockResolvedValue({
        ...routineToStart,
        status: RoutineStatus.IN_PROGRESS,
        startedAt: new Date(),
      });

      const result = await service.startRoutine('1');

      expect(result.status).toBe(RoutineStatus.IN_PROGRESS);
      expect(result.startedAt).toBeDefined();
    });
  });

  describe('completeRoutine', () => {
    it('should complete a routine and calculate duration', async () => {
      const startTime = new Date('2025-08-01T10:00:00Z');
      const routineInProgress = {
        ...mockDailyRoutine,
        status: RoutineStatus.IN_PROGRESS,
        startedAt: startTime,
      };

      mockDailyRoutineRepository.findOne.mockResolvedValue(routineInProgress);
      mockDailyRoutineRepository.save.mockImplementation((routine) => {
        return Promise.resolve(routine);
      });

      const result = await service.completeRoutine('1', 'Great workout!');

      expect(result.status).toBe(RoutineStatus.COMPLETED);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.completionNotes).toBe('Great workout!');
      expect(result.actualDurationMinutes).toBeGreaterThan(0);
    });
  });

  describe('findTodayRoutine', () => {
    it('should find today routine', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockDailyRoutineRepository.findOne.mockResolvedValue(mockDailyRoutine);

      const result = await service.findTodayRoutine();

      expect(result).toEqual(mockDailyRoutine);

      expect(mockDailyRoutineRepository.findOne).toHaveBeenCalledWith({
        where: { routineDate: today },
        relations: ['routineExercises', 'routineExercises.exercise'],
      });
    });
  });
});
