import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDailyRoutineDto } from './dto/create-daily-routine.dto';
import { UpdateDailyRoutineDto } from './dto/update-daily-routine.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';
import {
  JwtAuthGuard,
  Public,
} from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import {
  Roles,
  UserRole,
} from '../../../auth/application/decorators/roles.decorator';
import { DailyRoutineCrudUseCase } from '../../application/use-cases/daily-routine-crud.use-case';
import { DailyRoutineQueriesUseCase } from '../../application/use-cases/daily-routine-queries.use-case';
import { DailyRoutineLifecycleUseCase } from '../../application/use-cases/daily-routine-lifecycle.use-case';
import { RoutineExerciseManagementUseCase } from '../../application/use-cases/routine-exercise-management.use-case';
import { RoutineStatsUseCase } from '../../application/use-cases/routine-stats.use-case';
import { GenerateRoutineUseCase } from '../../application/use-cases/generate-routine.use-case';
import { GenerateRoutineDto } from './dto/generate-routine.dto';

@ApiTags('routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routines')
export class RoutinesController {
  constructor(
    private readonly crudUseCase: DailyRoutineCrudUseCase,
    private readonly queriesUseCase: DailyRoutineQueriesUseCase,
    private readonly lifecycleUseCase: DailyRoutineLifecycleUseCase,
    private readonly exerciseMgmtUseCase: RoutineExerciseManagementUseCase,
    private readonly statsUseCase: RoutineStatsUseCase,
    private readonly generateRoutineUseCase: GenerateRoutineUseCase,
  ) {}

  @Post('daily/generate')
  @Public()
  @ApiOperation({ summary: 'Generar rutina diaria con IA (Ollama)' })
  generateDailyRoutine(
    @Body() dto: GenerateRoutineDto,
    @Headers('x-cron-secret') cronSecret: string,
  ) {
    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      throw new UnauthorizedException('x-cron-secret inválido');
    }
    return this.generateRoutineUseCase.execute(dto);
  }

  // Endpoints para DailyRoutine
  @Post('daily')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Crear rutina diaria',
    description: 'Crea una nueva rutina de ejercicios para un día específico',
  })
  @ApiBody({
    type: CreateDailyRoutineDto,
    description: 'Datos de la rutina diaria',
  })
  @ApiResponse({
    status: 201,
    description: 'Rutina diaria creada exitosamente',
  })
  createDailyRoutine(@Body() createDto: CreateDailyRoutineDto) {
    return this.crudUseCase.create(createDto);
  }

  @Get('daily')
  @Public()
  findAllDailyRoutines() {
    return this.crudUseCase.findAll();
  }

  @Get('daily/by-date/:date')
  @Public()
  async findDailyRoutineByDate(@Param('date') date: string) {
    const routine = await this.queriesUseCase.findByDate(date);
    if (!routine) {
      throw new NotFoundException(
        `No se encontró rutina para la fecha ${date}`,
      );
    }
    return routine;
  }

  @Get('daily/date-range')
  findDailyRoutinesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.queriesUseCase.findByDateRange(startDate, endDate);
  }

  @Get('daily/today')
  @Public()
  async findTodayRoutine() {
    const routine = await this.queriesUseCase.findToday();
    if (!routine) {
      throw new NotFoundException('No se encontró rutina para hoy');
    }
    return routine;
  }

  @Get('daily/upcoming')
  findUpcomingRoutines(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.queriesUseCase.findUpcoming(daysNumber);
  }

  @Get('weekly')
  getWeekRoutines(@Query('startDate') startDate: string) {
    return this.queriesUseCase.getWeekRoutines(startDate);
  }

  @Get('monthly')
  getMonthRoutines(@Query('year') year: string, @Query('month') month: string) {
    return this.queriesUseCase.getMonthRoutines(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('daily/:id')
  findDailyRoutineById(@Param('id') id: string) {
    return this.crudUseCase.findById(id);
  }

  @Get('daily/:id/stats')
  getRoutineStats(@Param('id') id: string) {
    return this.statsUseCase.getRoutineStats(id);
  }

  @Get('progress/stats')
  getProgressStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsUseCase.getProgressStats(startDate, endDate);
  }

  @Patch('daily/:id')
  updateDailyRoutine(
    @Param('id') id: string,
    @Body() updateDto: UpdateDailyRoutineDto,
  ) {
    return this.crudUseCase.update(id, updateDto);
  }

  @Patch('daily/:id/start')
  startRoutine(@Param('id') id: string) {
    return this.lifecycleUseCase.startRoutine(id);
  }

  @Patch('daily/:id/complete')
  completeRoutine(
    @Param('id') id: string,
    @Body() body: { completionNotes?: string },
  ) {
    return this.lifecycleUseCase.completeRoutine(id, body.completionNotes);
  }

  @Patch('daily/:id/skip')
  skipRoutine(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycleUseCase.skipRoutine(id, body.reason);
  }

  @Delete('daily/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDailyRoutine(@Param('id') id: string) {
    return this.crudUseCase.delete(id);
  }

  // Endpoints para RoutineExercise
  @Post('exercises')
  addExerciseToRoutine(@Body() createDto: CreateRoutineExerciseDto) {
    return this.exerciseMgmtUseCase.addExercise(createDto);
  }

  @Patch('exercises/:id')
  updateRoutineExercise(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoutineExerciseDto,
  ) {
    return this.exerciseMgmtUseCase.updateExercise(id, updateDto);
  }

  @Delete('exercises/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExerciseFromRoutine(@Param('id') id: string) {
    return this.exerciseMgmtUseCase.removeExercise(id);
  }

  @Patch('daily/:routineId/reorder')
  reorderRoutineExercises(
    @Param('routineId') routineId: string,
    @Body() exerciseOrders: { id: string; order: number }[],
  ) {
    return this.exerciseMgmtUseCase.reorderExercises(routineId, exerciseOrders);
  }
}
