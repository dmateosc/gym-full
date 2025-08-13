const { Client } = require('pg');
require('dotenv').config({ path: './apps/backend/.env.local' });

async function fixDatabaseConstraints() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos Supabase');

    // 1. Verificar la estructura actual de la tabla
    console.log('\n📋 Verificando estructura actual de daily_routines...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'daily_routines' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Columnas actuales:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Verificar si existe la columna day_of_week
    const dayOfWeekColumn = tableInfo.rows.find(row => row.column_name === 'day_of_week');
    
    if (dayOfWeekColumn) {
      console.log('\n🛠️  Eliminando constraint NOT NULL de day_of_week...');
      
      // Primero hacer la columna nullable
      await client.query('ALTER TABLE daily_routines ALTER COLUMN day_of_week DROP NOT NULL;');
      console.log('✅ Constraint NOT NULL removido de day_of_week');

      // Luego eliminar la columna completamente
      await client.query('ALTER TABLE daily_routines DROP COLUMN IF EXISTS day_of_week;');
      console.log('✅ Columna day_of_week eliminada');
    } else {
      console.log('✅ Columna day_of_week no existe, no es necesario eliminarla');
    }

    // 3. Verificar que routine_date existe
    const routineDateColumn = tableInfo.rows.find(row => row.column_name === 'routine_date');
    if (!routineDateColumn) {
      console.log('\n🛠️  Agregando columna routine_date...');
      await client.query(`
        ALTER TABLE daily_routines 
        ADD COLUMN IF NOT EXISTS routine_date DATE;
      `);
      console.log('✅ Columna routine_date agregada');
    } else {
      console.log('✅ Columna routine_date ya existe');
    }

    // 4. Verificar que las nuevas columnas existen
    const requiredColumns = [
      'status', 'started_at', 'completed_at', 
      'actual_duration_minutes', 'completion_notes'
    ];

    for (const columnName of requiredColumns) {
      const columnExists = tableInfo.rows.find(row => row.column_name === columnName);
      if (!columnExists) {
        console.log(`\n🛠️  Agregando columna ${columnName}...`);
        
        let columnDef;
        switch (columnName) {
          case 'status':
            columnDef = `status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped'))`;
            break;
          case 'started_at':
            columnDef = `started_at TIMESTAMPTZ`;
            break;
          case 'completed_at':
            columnDef = `completed_at TIMESTAMPTZ`;
            break;
          case 'actual_duration_minutes':
            columnDef = `actual_duration_minutes INTEGER CHECK (actual_duration_minutes > 0)`;
            break;
          case 'completion_notes':
            columnDef = `completion_notes TEXT`;
            break;
        }
        
        await client.query(`ALTER TABLE daily_routines ADD COLUMN IF NOT EXISTS ${columnDef};`);
        console.log(`✅ Columna ${columnName} agregada`);
      }
    }

    // 5. Mostrar datos de ejemplo para verificar
    console.log('\n📊 Verificando datos existentes...');
    const sampleData = await client.query(`
      SELECT id, name, routine_date, status, created_at 
      FROM daily_routines 
      ORDER BY created_at DESC 
      LIMIT 3;
    `);
    
    console.log('Datos de ejemplo:');
    sampleData.rows.forEach(row => {
      console.log(`  - ID: ${row.id.substring(0, 8)}... | ${row.name} | Fecha: ${row.routine_date} | Estado: ${row.status}`);
    });

    console.log('\n✅ Base de datos actualizada correctamente');
    console.log('🚀 Ahora puedes crear nuevas rutinas sin problemas');

  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
fixDatabaseConstraints();
