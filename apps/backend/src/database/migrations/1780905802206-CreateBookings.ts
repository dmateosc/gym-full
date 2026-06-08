import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tabla de reservas para sesiones de clases colectivas.
 *
 * - Una reserva activa (`status != 'cancelled'`) por (sesión, usuario) — partial unique index.
 * - `position` solo se usa para ordenar la waitlist; se anula cuando una reserva pasa a confirmed.
 * - `ON DELETE CASCADE` sobre session_id para limpiar bookings si se borra la sesión.
 */
export class CreateBookings1780905802206 implements MigrationInterface {
  name = 'CreateBookings1780905802206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE bookings (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id  uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
        user_id     uuid NOT NULL REFERENCES user_profiles(id)  ON DELETE RESTRICT,
        status      varchar(20) NOT NULL,
        position    smallint,
        created_at  timestamptz NOT NULL DEFAULT NOW(),
        updated_at  timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT bookings_status_check CHECK (status IN ('confirmed','waitlist','cancelled')),
        CONSTRAINT bookings_position_check CHECK (
          position IS NULL OR (position BETWEEN 1 AND 10000)
        ),
        CONSTRAINT bookings_waitlist_needs_position CHECK (
          (status = 'waitlist' AND position IS NOT NULL)
          OR (status <> 'waitlist' AND position IS NULL)
        )
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX bookings_active_user_per_session_idx
        ON bookings(session_id, user_id)
        WHERE status <> 'cancelled'
    `);
    await queryRunner.query(
      `CREATE INDEX bookings_session_status_idx ON bookings(session_id, status)`,
    );
    await queryRunner.query(
      `CREATE INDEX bookings_user_status_idx ON bookings(user_id, status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bookings`);
  }
}
