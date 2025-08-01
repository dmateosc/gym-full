// Quick script to fix database constraints
const { Client } = require('pg');

async function fixDatabaseConstraints() {
  const client = new Client({
    connectionString: "postgresql://postgres.iluzwahldixdzotbaxne:JE2Dx6W2w7PlHAzv@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log('🔗 Connected to Supabase database');

    // First, check the current table structure
    console.log('\n🔍 Current table structure:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'daily_routines' 
      ORDER BY ordinal_position;
    `);
    console.table(tableStructure.rows);

    // Check if day_of_week column exists
    const dayOfWeekExists = tableStructure.rows.some(row => row.column_name === 'day_of_week');
    
    if (dayOfWeekExists) {
      console.log('\n🔧 Removing day_of_week column constraint and column...');
      
      // Make day_of_week nullable first
      await client.query('ALTER TABLE daily_routines ALTER COLUMN day_of_week DROP NOT NULL;');
      console.log('✅ Removed NOT NULL constraint from day_of_week');
      
      // Drop the column
      await client.query('ALTER TABLE daily_routines DROP COLUMN day_of_week;');
      console.log('✅ Dropped day_of_week column');
    } else {
      console.log('✅ day_of_week column does not exist, no changes needed');
    }

    // Verify the final structure
    console.log('\n🔍 Final table structure:');
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'daily_routines' 
      ORDER BY ordinal_position;
    `);
    console.table(finalStructure.rows);

    // Test data query
    console.log('\n📊 Sample data:');
    const sampleData = await client.query(`
      SELECT id, name, routine_date, status, created_at 
      FROM daily_routines 
      ORDER BY created_at DESC 
      LIMIT 3;
    `);
    console.table(sampleData.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

fixDatabaseConstraints();
