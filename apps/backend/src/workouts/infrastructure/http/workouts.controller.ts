import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../auth/application/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';
import { WorkoutsUseCase } from '../../application/use-cases/workouts.use-case';
import { LogSetDto } from './dto/log-set.dto';

@ApiTags('workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workouts: WorkoutsUseCase) {}

  @Post('start/:routineId')
  @ApiOperation({
    summary: 'Comenzar una sesión de entrenamiento sobre una rutina',
  })
  start(
    @Param('routineId') routineId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workouts.start({
      userId: user.sub,
      dailyRoutineId: routineId,
    });
  }

  @Get('mine')
  @ApiOperation({ summary: 'Listar mis sesiones de entrenamiento' })
  listMine(@CurrentUser() user: JwtPayload) {
    return this.workouts.listMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una sesión' })
  getOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.workouts.getMine(id, user.sub);
  }

  @Post(':id/sets')
  @ApiOperation({
    summary: 'Registrar (o sobrescribir) una serie en la sesión actual',
  })
  logSet(
    @Param('id') id: string,
    @Body() dto: LogSetDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workouts.logSet({
      userId: user.sub,
      sessionId: id,
      routineExerciseId: dto.routineExerciseId,
      setNumber: dto.setNumber,
      weight: dto.weight,
      reps: dto.reps,
      notes: dto.notes,
    });
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Finalizar la sesión' })
  complete(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workouts.complete({
      userId: user.sub,
      sessionId: id,
      notes: body?.notes,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Abandonar la sesión sin completarla' })
  abandon(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.workouts.abandon(id, user.sub);
  }
}
