import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the 'instructor' role to the user_profiles role check.
 *
 * The role column is already VARCHAR(20) so no type change is needed —
 * only the CHECK constraint is replaced so the DB enforces the new
 * three-value enum (admin / instructor / user).
 *
 * This is the first migration managed by TypeORM. The earlier SQL
 * migrations under supabase/migrations/ stay as historical reference;
 * they are already applied in every environment and TypeORM does not
 * know about them (and does not need to).
 */
export class AddInstructorRole1780659310281 implements MigrationInterface {
  name = 'AddInstructorRole1780659310281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_profiles
        DROP CONSTRAINT IF EXISTS user_profiles_role_check
    `);
    await queryRunner.query(`
      ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_role_check
        CHECK (role IN ('admin', 'instructor', 'user'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE user_profiles SET role = 'user' WHERE role = 'instructor'
    `);
    await queryRunner.query(`
      ALTER TABLE user_profiles
        DROP CONSTRAINT IF EXISTS user_profiles_role_check
    `);
    await queryRunner.query(`
      ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_role_check
        CHECK (role IN ('admin', 'user'))
    `);
  }
}
