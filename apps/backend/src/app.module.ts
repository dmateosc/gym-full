import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';
import { Exercise } from './exercises/entities/exercise.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Exercise],
      synchronize: false, // En producción debe ser false, las migraciones ya existen
      ssl: {
        rejectUnauthorized: false, // Para Supabase
      },
      logging: process.env.NODE_ENV === 'development', // Solo en desarrollo
    }),
    ExercisesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
