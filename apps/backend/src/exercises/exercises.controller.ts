import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';

@Controller('exercises')
export class ExercisesController {
  private readonly logger = new Logger(ExercisesController.name);

  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  async create(@Body(ValidationPipe) createExerciseDto: CreateExerciseDto) {
    const startTime = Date.now();
    this.logger.log(`📝 POST /exercises - Creating exercise: ${createExerciseDto.name}`);
    
    const result = await this.exercisesService.create(createExerciseDto);
    const duration = Date.now() - startTime;
    
    this.logger.log(`✅ POST /exercises - Created exercise with ID ${result.id} in ${duration}ms`);
    return result;
  }

  @Get()
  async findAll(@Query(ValidationPipe) filters: ExerciseFiltersDto) {
    this.logger.log(`📄 GET /exercises - Filters: ${JSON.stringify(filters)}`);
    const result = await this.exercisesService.findAll(filters);
    this.logger.log(`✅ GET /exercises - Returned ${result.length} exercises`);
    return result;
  }

  @Get('categories')
  async getCategories() {
    return this.exercisesService.getCategories();
  }

  @Get('muscle-groups')
  async getMuscleGroups() {
    return this.exercisesService.getMuscleGroups();
  }

  @Get('equipment')
  async getEquipment() {
    return this.exercisesService.getEquipment();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 GET /exercises/${id}`);
    const result = await this.exercisesService.findOne(id);
    this.logger.log(`✅ GET /exercises/${id} - Found: ${result.name}`);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.exercisesService.remove(id);
    return { message: `Exercise with ID ${id} has been deleted` };
  }
}
