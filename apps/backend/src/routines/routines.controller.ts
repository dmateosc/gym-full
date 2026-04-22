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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { CreateDailyRoutineDto } from './dto/create-daily-routine.dto';
import { UpdateDailyRoutineDto } from './dto/update-daily-routine.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';
import { JwtAuthGuard, Public } from '../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/application/guards/roles.guard';
import { Roles, UserRole } from '../auth/application/decorators/roles.decorator';
import { CurrentUser } from '../auth/application/decorators/current-user.decorator';
import { JwtPayload } from '../shared/infrastructure/jwt/jwt-verifier';

@ApiTags('routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

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
    return this.routinesService.createDailyRoutine(createDto);
  }

  @Get('daily')
  @Public()
  findAllDailyRoutines() {
    return this.routinesService.findAllDailyRoutines();
  }

  @Get('daily/by-date/:date')
  @Public()
  async findDailyRoutineByDate(@Param('date') date: string) {
    const routine = await this.routinesService.findDailyRoutineByDate(date);
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
    return this.routinesService.findDailyRoutinesByDateRange(
      startDate,
      endDate,
    );
  }

  @Get('daily/today')
  async findTodayRoutine() {
    const routine = await this.routinesService.findTodayRoutine();
    if (!routine) {
      throw new NotFoundException('No se encontró rutina para hoy');
    }
    return routine;
  }

  @Get('daily/upcoming')
  findUpcomingRoutines(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.routinesService.findUpcomingRoutines(daysNumber);
  }

  @Get('weekly')
  getWeekRoutines(@Query('startDate') startDate: string) {
    return this.routinesService.getWeekRoutines(startDate);
  }

  @Get('monthly')
  getMonthRoutines(@Query('year') year: string, @Query('month') month: string) {
    return this.routinesService.getMonthRoutines(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('daily/:id')
  findDailyRoutineById(@Param('id') id: string) {
    return this.routinesService.findDailyRoutineById(id);
  }

  @Get('daily/:id/stats')
  getRoutineStats(@Param('id') id: string) {
    return this.routinesService.getRoutineStats(id);
  }

  @Get('progress/stats')
  getProgressStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.routinesService.getProgressStats(startDate, endDate);
  }

  @Patch('daily/:id')
  updateDailyRoutine(
    @Param('id') id: string,
    @Body() updateDto: UpdateDailyRoutineDto,
  ) {
    return this.routinesService.updateDailyRoutine(id, updateDto);
  }

  @Patch('daily/:id/start')
  startRoutine(@Param('id') id: string) {
    return this.routinesService.startRoutine(id);
  }

  @Patch('daily/:id/complete')
  completeRoutine(
    @Param('id') id: string,
    @Body() body: { completionNotes?: string },
  ) {
    return this.routinesService.completeRoutine(id, body.completionNotes);
  }

  @Patch('daily/:id/skip')
  skipRoutine(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.routinesService.skipRoutine(id, body.reason);
  }

  @Delete('daily/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDailyRoutine(@Param('id') id: string) {
    return this.routinesService.deleteDailyRoutine(id);
  }

  // Endpoints para RoutineExercise
  @Post('exercises')
  addExerciseToRoutine(@Body() createDto: CreateRoutineExerciseDto) {
    return this.routinesService.addExerciseToRoutine(createDto);
  }

  @Patch('exercises/:id')
  updateRoutineExercise(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoutineExerciseDto,
  ) {
    return this.routinesService.updateRoutineExercise(id, updateDto);
  }

  @Delete('exercises/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExerciseFromRoutine(@Param('id') id: string) {
    return this.routinesService.removeExerciseFromRoutine(id);
  }

  @Patch('daily/:routineId/reorder')
  reorderRoutineExercises(
    @Param('routineId') routineId: string,
    @Body() exerciseOrders: { id: string; order: number }[],
  ) {
    return this.routinesService.reorderRoutineExercises(
      routineId,
      exerciseOrders,
    );
  }
}
