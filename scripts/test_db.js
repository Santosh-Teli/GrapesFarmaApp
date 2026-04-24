const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  const tables = [
    'profiles', 'farms', 'plots', 'pesticides', 'labourers',
    'spray_records', 'spray_pesticide_usages', 'cutting_records',
    'labour_work', 'other_expenses', 'payments'
  ];

  console.log("Checking database tables...");
  let allGood = true;

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    
    if (error) {
      console.log(`❌ Table '${table}' ERROR: ${error.message}`);
      allGood = false;
    } else {
      console.log(`✅ Table '${table}' exists and is accessible.`);
    }
  }

  if (allGood) {
    console.log("\nAll tables exist and the schema is correct and accessible!");
  } else {
    console.log("\nSome tables have issues.");
  }
}

testTables();
