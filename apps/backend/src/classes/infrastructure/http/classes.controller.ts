import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import { Roles } from '../../../auth/application/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/application/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';

import { CreateClassUseCase } from '../../application/use-cases/create-class.use-case';
import { UpdateClassUseCase } from '../../application/use-cases/update-class.use-case';
import { SoftDeleteClassUseCase } from '../../application/use-cases/soft-delete-class.use-case';
import {
  ListAllClassesUseCase,
  ListMyClassesUseCase,
} from '../../application/use-cases/list-classes.use-case';
import { ListTodaySessionsUseCase } from '../../application/use-cases/list-today-sessions.use-case';

import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  ClassResponseDto,
  TodaySessionResponseDto,
} from './dto/class-response.dto';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly createClass: CreateClassUseCase,
    private readonly updateClass: UpdateClassUseCase,
    private readonly softDeleteClass: SoftDeleteClassUseCase,
    private readonly listMyClasses: ListMyClassesUseCase,
    private readonly listAllClasses: ListAllClassesUseCase,
    private readonly listTodaySessions: ListTodaySessionsUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  // ─── User-facing: hoy ─────────────────────────────────────────────
  @Get('today')
  @ApiOperation({ summary: 'Clases programadas para hoy (Europe/Madrid)' })
  @ApiResponse({ status: 200, type: [TodaySessionResponseDto] })
  async today(
    @CurrentUser() user: JwtPayload,
  ): Promise<TodaySessionResponseDto[]> {
    const me = await this.resolveLocalUserIdOrNull(user);
    const views = await this.listTodaySessions.execute({
      userId: me ?? undefined,
    });
    return views.map((v) =>
      TodaySessionResponseDto.from(
        v.session,
        v.klass,
        v.counts,
        v.myBooking,
        v.instructorName,
      ),
    );
  }

  // ─── Instructor: gestionar sus propias clases ────────────────────
  @Get('mine')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: '[INSTRUCTOR] Listar clases del instructor autenticado',
  })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  async mine(@CurrentUser() user: JwtPayload): Promise<ClassResponseDto[]> {
    const me = await this.resolveLocalUserId(user);
    const list = await this.listMyClasses.execute(me);
    return list.map((c) => ClassResponseDto.fromDomain(c));
  }

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[INSTRUCTOR] Crear una nueva clase recurrente' })
  @ApiResponse({ status: 201, type: ClassResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateClassDto,
  ): Promise<ClassResponseDto> {
    const me = await this.resolveLocalUserId(user);
    const entity = await this.createClass.execute({
      requestingUserId: me,
      requestingUserRole: user.role as UserRole,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      durationMin: dto.durationMin,
      capacity: dto.capacity,
      location: dto.location,
      instructorId: dto.instructorId,
    });
    return ClassResponseDto.fromDomain(entity);
  }

  @Patch(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[INSTRUCTOR] Editar una clase propia' })
  @ApiResponse({ status: 200, type: ClassResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    const me = await this.resolveLocalUserId(user);
    const entity = await this.updateClass.execute({
      id,
      requestingUserId: me,
      requestingUserRole: user.role as UserRole,
      ...dto,
    });
    return ClassResponseDto.fromDomain(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: '[INSTRUCTOR] Desactivar (soft delete) una clase propia',
  })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    const me = await this.resolveLocalUserId(user);
    await this.softDeleteClass.execute({
      id,
      requestingUserId: me,
      requestingUserRole: user.role as UserRole,
    });
  }

  // ─── Admin: vista global ──────────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Listar todas las clases' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<ClassResponseDto[]> {
    const list = await this.listAllClasses.execute({
      activeOnly: activeOnly === 'true',
    });
    return list.map((c) => ClassResponseDto.fromDomain(c));
  }

  // ─── helpers ──────────────────────────────────────────────────────
  private async resolveLocalUserIdOrNull(
    user: JwtPayload,
  ): Promise<string | null> {
    const local = await this.userRepo.findBySupabaseId(user.sub);
    return local?.id ?? null;
  }

  private async resolveLocalUserId(user: JwtPayload): Promise<string> {
    const local = await this.userRepo.findBySupabaseId(user.sub);
    if (!local) {
      throw new NotFoundException(
        'Perfil local no encontrado — sincroniza tu cuenta antes de gestionar clases',
      );
    }
    const known: string[] = [
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.USER,
    ];
    if (!known.includes(user.role)) {
      throw new ForbiddenException('Rol desconocido');
    }
    return local.id;
  }
}
