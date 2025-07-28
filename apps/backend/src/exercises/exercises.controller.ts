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
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  async create(@Body(ValidationPipe) createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  async findAll(@Query(ValidationPipe) filters: ExerciseFiltersDto) {
    return this.exercisesService.findAll(filters);
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
    return this.exercisesService.findOne(id);
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
