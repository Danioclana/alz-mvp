
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const sql = `
      -- Add recipient_phones to alert_configs
      ALTER TABLE alert_configs ADD COLUMN IF NOT EXISTS recipient_phones text[] DEFAULT '{}';

      -- Add sent_to_phones to alert_history
      ALTER TABLE alert_history ADD COLUMN IF NOT EXISTS sent_to_phones text[] DEFAULT '{}';
    `;

        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await client.end();
    }
}

runMigration();
