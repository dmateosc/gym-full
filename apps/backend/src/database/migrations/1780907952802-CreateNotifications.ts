import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tabla de notificaciones in-app.
 *
 * Indexada por usuario + read_at para que el endpoint "no leídas"
 * sea barato. `payload` es JSONB para no atar la forma a un tipo
 * concreto (booking_confirmed, booking_promoted, daily_reminder).
 */
export class CreateNotifications1780907952802 implements MigrationInterface {
  name = 'CreateNotifications1780907952802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        type       varchar(40) NOT NULL,
        title      varchar(200) NOT NULL,
        body       text NOT NULL,
        payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
        read_at    timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT notifications_type_check CHECK (type IN (
          'booking_confirmed','booking_promoted','daily_reminder'
        ))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX notifications_user_read_idx ON notifications(user_id, read_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}
