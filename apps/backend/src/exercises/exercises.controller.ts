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
  create(@Body(ValidationPipe) createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  findAll(@Query(ValidationPipe) filters: ExerciseFiltersDto) {
    return this.exercisesService.findAll(filters);
  }

  @Get('categories')
  getCategories() {
    return this.exercisesService.getCategories();
  }

  @Get('muscle-groups')
  getMuscleGroups() {
    return this.exercisesService.getMuscleGroups();
  }

  @Get('equipment')
  getEquipment() {
    return this.exercisesService.getEquipment();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.exercisesService.remove(id);
    return { message: `Exercise with ID ${id} has been deleted` };
  }
}
