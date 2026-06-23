import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `workout_sessions` para que el usuario pueda anotar
 * lo que efectivamente hace cuando ejecuta una rutina: peso, reps
 * por serie, notas, y un timestamp de inicio/finalización.
 *
 * Sin segunda tabla por simplicidad: los logs van en una columna
 * JSONB. La forma esperada es:
 *
 *   [
 *     {
 *       "routineExerciseId": "uuid",
 *       "sets": [
 *         { "setNumber": 1, "weight": 60, "reps": 10, "completedAt": "..." }
 *       ]
 *     }
 *   ]
 *
 * Si más adelante necesitamos analíticas serias migraremos a una
 * tabla normalizada `workout_set_logs`.
 */
export class AddWorkoutSessions1781100000000 implements MigrationInterface {
  name = 'AddWorkoutSessions1781100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE workout_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        daily_routine_id uuid NOT NULL REFERENCES daily_routines(id) ON DELETE CASCADE,
        started_at timestamptz NOT NULL DEFAULT NOW(),
        completed_at timestamptz NULL,
        status varchar(16) NOT NULL DEFAULT 'in_progress',
        logs jsonb NOT NULL DEFAULT '[]'::jsonb,
        notes text NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT workout_sessions_status_check
          CHECK (status IN ('in_progress','completed','abandoned'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_workout_sessions_user_id
        ON workout_sessions (user_id, started_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_workout_sessions_routine
        ON workout_sessions (daily_routine_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_workout_sessions_routine`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_workout_sessions_user_id`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS workout_sessions`);
  }
}
