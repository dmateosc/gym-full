import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserRoutineDto } from './create-user-routine.dto';
import { RoutineVisibility } from '../../persistence/daily-routine.orm-entity';

export class UpdateUserRoutineDto extends PartialType(CreateUserRoutineDto) {
  @IsOptional()
  @IsEnum(RoutineVisibility)
  visibility?: RoutineVisibility;
}
