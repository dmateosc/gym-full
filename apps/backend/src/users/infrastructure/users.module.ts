import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserProfileOrmEntity } from './persistence/user-profile.orm-entity';
import { UserTypeormRepository } from './persistence/user.typeorm-repository';
import { UsersController } from './http/users.controller';

import { GetAllUsersUseCase } from '../application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/get-user-by-id.use-case';
import { UpdateUserRoleUseCase } from '../application/use-cases/update-user-role.use-case';
import { UpsertUserProfileUseCase } from '../application/use-cases/upsert-user-profile.use-case';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileOrmEntity])],
  controllers: [UsersController],
  providers: [
    // Binding del puerto al adaptador (inyección de dependencia invertida)
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeormRepository,
    },
    // Casos de uso
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserRoleUseCase,
    UpsertUserProfileUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    GetUserByIdUseCase,
    UpsertUserProfileUseCase,
  ],
})
export class UsersModule {}
