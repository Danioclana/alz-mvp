
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlertConfig() {
    const hardwareId = 'teste';

    // Get device ID
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', hardwareId)
        .single();

    if (!device) {
        console.error('Device not found');
        return;
    }

    const { data: config, error } = await supabase
        .from('alert_configs')
        .select('*')
        .eq('device_id', device.id)
        .single();

    if (error) {
        console.error('Error fetching config:', error);
        return;
    }

    console.log('Current Phones:', config.recipient_phones);

    const { data: updated, error: updateError } = await supabase
        .from('alert_configs')
        .update({ recipient_phones: ['553189277806'] })
        .eq('id', config.id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating phones:', updateError);
    } else {
        console.log('Updated Phones:', updated.recipient_phones);
    }
}

checkAlertConfig();
