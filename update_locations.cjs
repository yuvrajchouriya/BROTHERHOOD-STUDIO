const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nctqqkbhfbhtvjjiqxeg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

async function updateLocations() {
    // Check if we have a key
    if (!supabaseServiceKey) {
        console.log('No SUPABASE_SERVICE_KEY set. Please run with:');
        console.log('SUPABASE_SERVICE_KEY=your_key node update_locations.cjs');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all locations
    const { data: locations, error } = await supabase.from('locations').select('*');
    if (error) {
        console.error('Error fetching locations:', error);
        process.exit(1);
    }
    console.log('Current locations:', JSON.stringify(locations, null, 2));
}

updateLocations();
