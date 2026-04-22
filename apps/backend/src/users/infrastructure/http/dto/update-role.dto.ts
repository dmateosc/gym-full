import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domain/value-objects/user-role.vo';

export class UpdateRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Nuevo rol para el usuario',
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
