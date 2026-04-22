import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertProfileDto {
  @ApiProperty({ description: 'Nombre completo del usuario', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'URL del avatar', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
