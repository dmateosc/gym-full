import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Habilita rutinas propias del usuario sobre la tabla `daily_routines`:
 *  - `owner_user_id`: NULL para las rutinas del sistema (las diarias
 *    generadas por IA); UUID para las creadas o clonadas por un usuario.
 *  - `is_template`: true cuando la rutina no está atada a una fecha y
 *    es reutilizable (las del usuario). Para las del sistema sigue
 *    siendo false.
 *  - `cloned_from_id`: si la rutina nació clonando otra, guardamos
 *    la fuente para trazabilidad (no para sincronización: la clonación
 *    es snapshot).
 *  - `visibility`: prepara terreno para "rutinas públicas". Por ahora
 *    todas las creadas por usuario son 'private'.
 *
 * `routine_date` pasa a NULLABLE: los templates de usuario no tienen
 * fecha fija. Las rutinas del sistema seguirán llevándola.
 */
export class AddUserOwnedRoutines1781000000000 implements MigrationInterface {
  name = 'AddUserOwnedRoutines1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE daily_routines ALTER COLUMN routine_date DROP NOT NULL`,
    );

    await queryRunner.query(`
      ALTER TABLE daily_routines
        ADD COLUMN owner_user_id uuid NULL,
        ADD COLUMN is_template boolean NOT NULL DEFAULT false,
        ADD COLUMN cloned_from_id uuid NULL REFERENCES daily_routines(id) ON DELETE SET NULL,
        ADD COLUMN visibility varchar(16) NOT NULL DEFAULT 'private'
    `);

    await queryRunner.query(`
      ALTER TABLE daily_routines
        ADD CONSTRAINT daily_routines_visibility_check
        CHECK (visibility IN ('private','public'))
    `);

    await queryRunner.query(`
      CREATE INDEX idx_daily_routines_owner_user_id
        ON daily_routines (owner_user_id)
        WHERE owner_user_id IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX idx_daily_routines_visibility_public
        ON daily_routines (visibility)
        WHERE visibility = 'public'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_daily_routines_visibility_public`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_daily_routines_owner_user_id`);
    await queryRunner.query(`
      ALTER TABLE daily_routines
        DROP CONSTRAINT IF EXISTS daily_routines_visibility_check
    `);
    await queryRunner.query(`
      ALTER TABLE daily_routines
        DROP COLUMN IF EXISTS visibility,
        DROP COLUMN IF EXISTS cloned_from_id,
        DROP COLUMN IF EXISTS is_template,
        DROP COLUMN IF EXISTS owner_user_id
    `);
    await queryRunner.query(`
      UPDATE daily_routines SET routine_date = CURRENT_DATE WHERE routine_date IS NULL
    `);
    await queryRunner.query(
      `ALTER TABLE daily_routines ALTER COLUMN routine_date SET NOT NULL`,
    );
  }
}
