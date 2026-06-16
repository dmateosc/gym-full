import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Borra todos los datos personales del usuario autenticado (RGPD-style):
 *  1. Sus rutinas propias (las RoutineExercise asociadas se eliminan por
 *     el FK ON DELETE CASCADE de la tabla routine_exercises).
 *  2. Su fila en user_profiles.
 *  3. Si está configurado `SUPABASE_SERVICE_ROLE_KEY` en el backend,
 *     también elimina el usuario de Supabase Auth para que no pueda
 *     volver a iniciar sesión. Si no está configurado, el usuario se
 *     queda sin perfil pero podría reaparecer como nuevo en el próximo
 *     login con el mismo email.
 */
@Injectable()
export class DeleteOwnAccountUseCase {
  private readonly logger = new Logger(DeleteOwnAccountUseCase.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async execute(supabaseUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `DELETE FROM daily_routines WHERE owner_user_id = $1`,
        [supabaseUserId],
      );
      await manager.query(`DELETE FROM user_profiles WHERE supabase_id = $1`, [
        supabaseUserId,
      ]);
    });

    await this.deleteSupabaseAuthUser(supabaseUserId);
  }

  private async deleteSupabaseAuthUser(supabaseUserId: string): Promise<void> {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY no configurado: el perfil local se ha borrado pero el usuario de Supabase Auth sigue existiendo.',
      );
      return;
    }
    try {
      const res = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${supabaseUserId}`,
        {
          method: 'DELETE',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        },
      );
      if (!res.ok) {
        const body = await res.text();
        this.logger.error(
          `Supabase admin deleteUser falló (${res.status}): ${body}`,
        );
      }
    } catch (e) {
      this.logger.error('Error llamando a Supabase admin deleteUser', e);
    }
  }
}
