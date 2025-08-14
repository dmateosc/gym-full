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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  private readonly logger = new Logger(ExercisesController.name);

  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo ejercicio',
    description:
      'Crea un nuevo ejercicio en el sistema con toda la información necesaria',
  })
  @ApiBody({
    type: CreateExerciseDto,
    description: 'Datos del ejercicio a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Ejercicio creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(@Body(ValidationPipe) createExerciseDto: CreateExerciseDto) {
    const startTime = Date.now();
    this.logger.log(
      `📝 POST /exercises - Creating exercise: ${createExerciseDto.name}`,
    );
    const result = await this.exercisesService.create(createExerciseDto);
    const duration = Date.now() - startTime;
    this.logger.log(
      `✅ POST /exercises - Created exercise with ID ${result.id} in ${duration}ms`,
    );
    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los ejercicios',
    description:
      'Obtiene la lista de ejercicios con filtros opcionales por categoría, dificultad, grupo muscular, etc.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoría (fuerza, cardio, flexibilidad)',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Filtrar por dificultad (principiante, intermedio, avanzado)',
  })
  @ApiQuery({
    name: 'muscleGroup',
    required: false,
    description: 'Filtrar por grupo muscular',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ejercicios obtenida exitosamente',
  })
  async findAll(@Query(ValidationPipe) filters: ExerciseFiltersDto) {
    this.logger.log(`📄 GET /exercises - Filters: ${JSON.stringify(filters)}`);
    const result = await this.exercisesService.findAll(filters);
    this.logger.log(`✅ GET /exercises - Returned ${result.length} exercises`);
    return result;
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener categorías de ejercicios',
    description:
      'Obtiene todas las categorías disponibles (fuerza, cardio, flexibilidad, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  async getCategories() {
    return this.exercisesService.getCategories();
  }

  @Get('muscle-groups')
  @ApiOperation({
    summary: 'Obtener grupos musculares',
    description: 'Obtiene todos los grupos musculares disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos musculares obtenida exitosamente',
  })
  async getMuscleGroups() {
    return this.exercisesService.getMuscleGroups();
  }

  @Get('equipment')
  @ApiOperation({
    summary: 'Obtener equipamiento disponible',
    description: 'Obtiene lista de todo el equipamiento disponible',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de equipamiento obtenida exitosamente',
  })
  async getEquipment() {
    return this.exercisesService.getEquipment();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas del sistema',
    description:
      'Obtiene estadísticas completas de ejercicios, categorías y uso del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalExercises: { type: 'number', example: 54 },
        byCategory: {
          type: 'object',
          example: { strength: 25, cardio: 15, flexibility: 14 },
        },
        byDifficulty: {
          type: 'object',
          example: { beginner: 18, intermediate: 24, advanced: 12 },
        },
        totalEquipment: { type: 'number', example: 8 },
        totalMuscleGroups: { type: 'number', example: 12 },
      },
    },
  })
  async getStatistics() {
    const startTime = Date.now();
    this.logger.log('📊 GET /exercises/statistics - Generating statistics');

    const stats = await this.exercisesService.getStatistics();
    const duration = Date.now() - startTime;

    this.logger.log(
      `✅ GET /exercises/statistics - Generated in ${duration}ms`,
    );
    return stats;
  }

  @Get('search')
  @ApiOperation({
    summary: 'Búsqueda avanzada de ejercicios',
    description:
      'Busca ejercicios por nombre, descripción o instrucciones usando texto libre',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Término de búsqueda (nombre, descripción, instrucciones)',
    example: 'flexiones',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoría adicional',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
  })
  async searchExercises(
    @Query('q') searchTerm: string,
    @Query('category') category?: string,
  ) {
    const startTime = Date.now();
    this.logger.log(
      `🔍 GET /exercises/search - Searching for: "${searchTerm}"`,
    );

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const results = await this.exercisesService.searchExercises(
      searchTerm,
      category,
    );
    const duration = Date.now() - startTime;

    this.logger.log(
      `✅ GET /exercises/search - Found ${results.length} results in ${duration}ms`,
    );
    return results;
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
