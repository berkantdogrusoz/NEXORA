import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    const { data, error } = await supabase
        .from('generations')
        .select('*, user_id')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase error:', error);
        return;
    }

    console.log(`Found ${data.length} generations in the last 2 days.`);

    // Group by model
    const modelCounts = {};
    const userCounts = {};

    data.forEach(gen => {
        modelCounts[gen.model] = (modelCounts[gen.model] || 0) + 1;
        userCounts[gen.user_id] = (userCounts[gen.user_id] || 0) + 1;
    });

    console.log('--- Model Counts ---');
    console.log(modelCounts);

    console.log('--- User Counts ---');
    console.log(userCounts);
}

check();
