import { PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiPropertyOptional({
    description: 'Reactivar/desactivar la clase (soft delete)',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
