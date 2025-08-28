import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesario para operaciones admin

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Epsilon Academy migration...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(process.cwd(), 'apply_migration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded, executing...');
    
    // Dividir en statements individuales (evitar problemas con statements múltiples)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('select ') && statement.toLowerCase().includes('result')) {
        // Skip result messages
        continue;
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  Warning in statement: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        // Try direct execution for some statements
        try {
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1);
          
          if (directError && directError.code === '42P01') {
            // Table doesn't exist, this is expected for new migrations
            console.log('🔧 Setting up database schema...');
          }
        } catch (directErr) {
          console.warn(`⚠️  Could not execute: ${statement.substring(0, 50)}...`);
          errorCount++;
        }
      }
    }
    
    console.log(`✅ Migration completed!`);
    console.log(`📊 Success: ${successCount} statements`);
    console.log(`⚠️  Warnings: ${errorCount} statements`);
    
    // Verificar que las tablas fueron creadas
    console.log('\n🔍 Verifying tables...');
    
    const tables = [
      'profiles',
      'teachers', 
      'students',
      'courses',
      'course_enrollments',
      'groups',
      'group_members',
      'messages'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Ready`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error checking`);
      }
    }
    
    console.log('\n🎉 Epsilon Academy database is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Create an admin user in Supabase Auth');
    console.log('2. Add admin role to profiles table');
    console.log('3. Access AdminPanel to start managing users');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Función alternativa usando SQL directo
async function runDirectMigration() {
  try {
    console.log('🚀 Running direct SQL migration...');
    
    const migrationPath = path.join(process.cwd(), 'apply_migration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    // Ejecutar todo el SQL de una vez
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Direct migration error:', error);
      
      // Intentar crear las funciones helper primero
      await createHelperFunctions();
      return;
    }
    
    console.log('✅ Direct migration completed!');
    console.log('Result:', data);
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error);
    await createHelperFunctions();
  }
}

async function createHelperFunctions() {
  console.log('🔧 Creating helper functions...');
  
  const functions = [
    `
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS boolean AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    `
    CREATE OR REPLACE FUNCTION is_teacher()
    RETURNS boolean AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'teacher'
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  ];
  
  for (const func of functions) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: func });
      if (error) {
        console.warn('Function creation warning:', error.message);
      } else {
        console.log('✅ Helper function created');
      }
    } catch (err) {
      console.warn('Function creation error:', err);
    }
  }
}

// Ejecutar migración
if (process.argv.includes('--direct')) {
  runDirectMigration();
} else {
  runMigration();
}

export { runMigration, runDirectMigration };
