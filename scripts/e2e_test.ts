import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("🚀 Starting E2E Data Testing...");

  // 1. Create a mock user using auth signup
  const testEmail = `e2e_test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  console.log(`\n👤 Creating test user: ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'E2E Test User',
        role: 'FARMER'
      }
    }
  });

  if (authError) {
    console.error("❌ Failed to create user:", authError.message);
    return;
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error("❌ User ID not returned!");
    return;
  }
  console.log(`✅ User created successfully! ID: ${userId}`);

  // Wait a second for trigger to create profile
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // 2. Test Farm Creation
    console.log(`\n🚜 Testing Farm Creation...`);
    const farmId = randomUUID();
    const { data: farm, error: farmError } = await supabase.from('farms').insert({
      id: farmId,
      owner_id: userId,
      name: 'E2E Test Farm',
      total_acres: 10,
      location: 'Test City',
    }).select().single();

    if (farmError) throw new Error(`Farm Error: ${farmError.message}`);
    console.log(`✅ Farm created! ID: ${farm.id}`);

    // 3. Test Plot Creation
    console.log(`\n🌱 Testing Plot Creation...`);
    const plotId = randomUUID();
    const { data: plot, error: plotError } = await supabase.from('plots').insert({
      id: plotId,
      farm_id: farmId,
      user_id: userId,
      name: 'Test Plot 1',
      area_acres: 5,
      grape_variety: 'Thompson',
    }).select().single();

    if (plotError) throw new Error(`Plot Error: ${plotError.message}`);
    console.log(`✅ Plot created! ID: ${plot.id}`);

    // 4. Test Pesticide Creation
    console.log(`\n🧪 Testing Pesticide Creation...`);
    const pesticideId = randomUUID();
    const { data: pesticide, error: pestError } = await supabase.from('pesticides').insert({
      id: pesticideId,
      user_id: userId,
      name: 'Test Pesticide',
      unit_type: 'ml',
      price_per_unit: 10,
      stock_quantity: 1000,
    }).select().single();

    if (pestError) throw new Error(`Pesticide Error: ${pestError.message}`);
    console.log(`✅ Pesticide created! ID: ${pesticide.id}`);

    // 5. Test Labour Creation
    console.log(`\n👷 Testing Labour Creation...`);
    const labourId = randomUUID();
    const { data: labour, error: labourError } = await supabase.from('labourers').insert({
      id: labourId,
      user_id: userId,
      name: 'Test Labourer',
      gender: 'Male',
      per_day_salary: 400,
      skill_type: 'General',
    }).select().single();

    if (labourError) throw new Error(`Labour Error: ${labourError.message}`);
    console.log(`✅ Labour created! ID: ${labour.id}`);

    // 6. Test Spray Record
    console.log(`\n💦 Testing Spray Record...`);
    const sprayId = randomUUID();
    const { data: spray, error: sprayError } = await supabase.from('spray_records').insert({
      id: sprayId,
      user_id: userId,
      plot_id: plotId,
      spray_date: new Date().toISOString().split('T')[0],
      crop_stage: 'Growth',
      weather_condition: 'Sunny',
      spray_reason: 'Preventive',
    }).select().single();

    if (sprayError) throw new Error(`Spray Error: ${sprayError.message}`);
    console.log(`✅ Spray Record created! ID: ${spray.id}`);

    // 7. Clean up
    console.log(`\n🧹 Cleaning up test data...`);
    await supabase.from('farms').delete().eq('id', farmId);
    await supabase.from('pesticides').delete().eq('id', pesticideId);
    await supabase.from('labourers').delete().eq('id', labourId);
    console.log(`✅ Cleanup complete!`);

  } catch (e: any) {
    console.error(`\n❌ TEST FAILED: ${e.message}`);
  } finally {
    // Delete test user if possible (requires service role, but we can just leave it or try to delete)
    // Supabase JS doesn't allow user deletion without service_role key.
    console.log("\n🎉 E2E Test Suite Finished!");
  }
}

runTest();
