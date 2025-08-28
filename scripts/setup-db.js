const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Epsilon Academy - Database Migration');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.log('📋 Please create .env.local with your Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('✅ Environment loaded');
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

// Check if migration file exists
const migrationPath = path.join(process.cwd(), 'apply_migration.sql');
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found: apply_migration.sql');
  process.exit(1);
}

console.log('✅ Migration file found');

// Instructions for manual execution
console.log('\n📋 Manual Migration Instructions:');
console.log('================================');
console.log('1. Open your Supabase dashboard');
console.log('2. Go to SQL Editor');
console.log('3. Copy and paste the contents of apply_migration.sql');
console.log('4. Execute the migration');
console.log('\nOR');
console.log('5. Use psql command line:');
console.log(`   psql -h [your-supabase-host] -U postgres -d [your-database] -f apply_migration.sql`);

console.log('\n🎯 After migration:');
console.log('- Create an admin user in Supabase Auth');
console.log('- Add admin role to profiles table');
console.log('- Run: npm run dev');
console.log('- Access /dashboard to start using the system');

console.log('\n📖 Full documentation: EPSILON_ACADEMY_DOCS.md');

// Show migration content summary
const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
const tables = migrationContent.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g) || [];
console.log('\n📊 Tables to be created:');
tables.forEach(table => {
  const tableName = table.replace('CREATE TABLE IF NOT EXISTS public.', '');
  console.log(`  - ${tableName}`);
});

console.log('\n🔒 Security features:');
console.log('  - Row Level Security (RLS) enabled');
console.log('  - Role-based access control (admin/teacher/student)');
console.log('  - Secure chat system with teacher-student relationships');

console.log('\n✨ Ready to transform education with Epsilon Academy!');
