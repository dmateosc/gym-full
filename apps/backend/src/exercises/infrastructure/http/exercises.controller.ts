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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';
import {
  JwtAuthGuard,
  Public,
} from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import {
  Roles,
  UserRole,
} from '../../../auth/application/decorators/roles.decorator';
import { FindAllExercisesUseCase } from '../../application/use-cases/find-all-exercises.use-case';
import { FindExerciseByIdUseCase } from '../../application/use-cases/find-exercise-by-id.use-case';
import { CreateExerciseUseCase } from '../../application/use-cases/create-exercise.use-case';
import { UpdateExerciseUseCase } from '../../application/use-cases/update-exercise.use-case';
import { DeleteExerciseUseCase } from '../../application/use-cases/delete-exercise.use-case';
import { GetExerciseMetadataUseCase } from '../../application/use-cases/get-exercise-metadata.use-case';
import { SearchExercisesUseCase } from '../../application/use-cases/search-exercises.use-case';

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
  private readonly logger = new Logger(ExercisesController.name);

  constructor(
    private readonly findAllUseCase: FindAllExercisesUseCase,
    private readonly findByIdUseCase: FindExerciseByIdUseCase,
    private readonly createUseCase: CreateExerciseUseCase,
    private readonly updateUseCase: UpdateExerciseUseCase,
    private readonly deleteUseCase: DeleteExerciseUseCase,
    private readonly metadataUseCase: GetExerciseMetadataUseCase,
    private readonly searchUseCase: SearchExercisesUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
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
      `POST /exercises - Creating exercise: ${createExerciseDto.name}`,
    );
    const result = await this.createUseCase.execute(createExerciseDto);
    const duration = Date.now() - startTime;
    this.logger.log(
      `POST /exercises - Created exercise with ID ${result.id} in ${duration}ms`,
    );
    return result;
  }

  @Get()
  @Public()
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
    this.logger.log(`GET /exercises - Filters: ${JSON.stringify(filters)}`);
    const result = await this.findAllUseCase.execute(filters);
    this.logger.log(`GET /exercises - Returned ${result.length} exercises`);
    return result;
  }

  @Get('categories')
  @Public()
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
    return this.metadataUseCase.getCategories();
  }

  @Get('muscle-groups')
  @Public()
  @ApiOperation({
    summary: 'Obtener grupos musculares',
    description: 'Obtiene todos los grupos musculares disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos musculares obtenida exitosamente',
  })
  async getMuscleGroups() {
    return this.metadataUseCase.getMuscleGroups();
  }

  @Get('equipment')
  @Public()
  @ApiOperation({
    summary: 'Obtener equipamiento disponible',
    description: 'Obtiene lista de todo el equipamiento disponible',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de equipamiento obtenida exitosamente',
  })
  async getEquipment() {
    return this.metadataUseCase.getEquipment();
  }

  @Get('statistics')
  @Public()
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
    this.logger.log('GET /exercises/statistics - Generating statistics');
    const stats = await this.metadataUseCase.getStatistics();
    const duration = Date.now() - startTime;
    this.logger.log(
      `GET /exercises/statistics - Generated in ${duration}ms`,
    );
    return stats;
  }

  @Get('search')
  @Public()
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
      `GET /exercises/search - Searching for: "${searchTerm}"`,
    );

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const results = await this.searchUseCase.execute(searchTerm, category);
    const duration = Date.now() - startTime;

    this.logger.log(
      `GET /exercises/search - Found ${results.length} results in ${duration}ms`,
    );
    return results;
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /exercises/${id}`);
    const result = await this.findByIdUseCase.execute(id);
    this.logger.log(`GET /exercises/${id} - Found: ${result.name}`);
    return result;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.updateUseCase.execute(id, updateExerciseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.deleteUseCase.execute(id);
    return { message: `Exercise with ID ${id} has been deleted` };
  }
}
