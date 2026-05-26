import { IsDateString, IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { RoutineIntensity } from '../../persistence/daily-routine.orm-entity';

export class GenerateRoutineDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(RoutineIntensity)
  intensity?: RoutineIntensity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];
}
