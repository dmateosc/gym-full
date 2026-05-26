import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyRoutineDto } from './create-daily-routine.dto';

export class UpdateDailyRoutineDto extends PartialType(CreateDailyRoutineDto) {}
