import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassOrmEntity } from './infrastructure/persistence/class.orm-entity';
import { ClassSessionOrmEntity } from './infrastructure/persistence/class-session.orm-entity';
import { ClassTypeormRepository } from './infrastructure/persistence/class.typeorm-repository';
import { ClassSessionTypeormRepository } from './infrastructure/persistence/class-session.typeorm-repository';
import { ClassesController } from './infrastructure/http/classes.controller';

import { CreateClassUseCase } from './application/use-cases/create-class.use-case';
import { UpdateClassUseCase } from './application/use-cases/update-class.use-case';
import { SoftDeleteClassUseCase } from './application/use-cases/soft-delete-class.use-case';
import {
  ListAllClassesUseCase,
  ListMyClassesUseCase,
} from './application/use-cases/list-classes.use-case';
import { ListTodaySessionsUseCase } from './application/use-cases/list-today-sessions.use-case';

import { CLASS_REPOSITORY } from './domain/repositories/class.repository.port';
import { CLASS_SESSION_REPOSITORY } from './domain/repositories/class-session.repository.port';
import { UsersModule } from '../users/infrastructure/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassOrmEntity, ClassSessionOrmEntity]),
    UsersModule, // necesitamos USER_REPOSITORY en el controller
  ],
  controllers: [ClassesController],
  providers: [
    { provide: CLASS_REPOSITORY, useClass: ClassTypeormRepository },
    { provide: CLASS_SESSION_REPOSITORY, useClass: ClassSessionTypeormRepository },
    CreateClassUseCase,
    UpdateClassUseCase,
    SoftDeleteClassUseCase,
    ListMyClassesUseCase,
    ListAllClassesUseCase,
    ListTodaySessionsUseCase,
  ],
  exports: [CLASS_REPOSITORY, CLASS_SESSION_REPOSITORY],
})
export class ClassesModule {}
