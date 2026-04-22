import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domain/value-objects/user-role.vo';
import { UserEntity } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'ID único del perfil de usuario' })
  id: string;

  @ApiProperty({ description: 'ID del usuario en Supabase Auth' })
  supabaseId: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Nombre completo', nullable: true })
  fullName: string | null;

  @ApiProperty({ description: 'URL del avatar', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: UserRole, description: 'Rol del usuario' })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.supabaseId = entity.supabaseId;
    dto.email = entity.email;
    dto.fullName = entity.fullName;
    dto.avatarUrl = entity.avatarUrl;
    dto.role = entity.role.value;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
