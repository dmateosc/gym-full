import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Amplía el CHECK de `notifications.type` para aceptar el nuevo
 * evento `class_assigned`, que se dispara cuando un admin asigna a
 * un instructor (creación o reasignación de una clase).
 */
export class AddClassAssignedNotification1780921575694
  implements MigrationInterface
{
  name = 'AddClassAssignedNotification1780921575694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check`,
    );
    await queryRunner.query(`
      ALTER TABLE notifications
        ADD CONSTRAINT notifications_type_check
        CHECK (type IN (
          'booking_confirmed','booking_promoted','daily_reminder','class_assigned'
        ))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE notifications SET type = 'booking_confirmed' WHERE type = 'class_assigned'`,
    );
    await queryRunner.query(
      `ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check`,
    );
    await queryRunner.query(`
      ALTER TABLE notifications
        ADD CONSTRAINT notifications_type_check
        CHECK (type IN ('booking_confirmed','booking_promoted','daily_reminder'))
    `);
  }
}
