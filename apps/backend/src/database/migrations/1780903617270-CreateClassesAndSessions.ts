import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the schema for group classes:
 *  - `classes`: weekly recurring template (instructor, day of week,
 *    start time, capacity, soft-delete via `active`).
 *  - `class_sessions`: concrete occurrences materialised lazily for the
 *    current day. Uniqueness on (class_id, scheduled_at) is what makes
 *    the on-demand UPSERT safe.
 *
 * Bookings live in a separate table introduced by the next PR.
 */
export class CreateClassesAndSessions1780903617270
  implements MigrationInterface
{
  name = 'CreateClassesAndSessions1780903617270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE classes (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        instructor_id   uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
        name            varchar(200) NOT NULL,
        description     text,
        category        varchar(30) NOT NULL,
        day_of_week     smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time      time NOT NULL,
        duration_min    smallint NOT NULL CHECK (duration_min BETWEEN 1 AND 600),
        capacity        smallint NOT NULL CHECK (capacity BETWEEN 1 AND 1000),
        location        varchar(120),
        active          boolean NOT NULL DEFAULT true,
        created_at      timestamptz NOT NULL DEFAULT NOW(),
        updated_at      timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT classes_category_check CHECK (category IN (
          'cycling','yoga','pilates','hiit','strength','dance','functional','crossfit','other'
        ))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX classes_instructor_active_idx ON classes(instructor_id, active)`,
    );
    await queryRunner.query(
      `CREATE INDEX classes_active_dow_idx       ON classes(active, day_of_week)`,
    );

    await queryRunner.query(`
      CREATE TABLE class_sessions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id            uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        scheduled_at        timestamptz NOT NULL,
        capacity_override   smallint CHECK (capacity_override IS NULL OR (capacity_override BETWEEN 1 AND 1000)),
        status              varchar(20) NOT NULL DEFAULT 'scheduled',
        created_at          timestamptz NOT NULL DEFAULT NOW(),
        updated_at          timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT class_sessions_status_check CHECK (status IN ('scheduled','cancelled','completed')),
        CONSTRAINT class_sessions_unique_slot UNIQUE (class_id, scheduled_at)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX class_sessions_scheduled_at_idx ON class_sessions(scheduled_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS class_sessions`);
    await queryRunner.query(`DROP TABLE IF EXISTS classes`);
  }
}
