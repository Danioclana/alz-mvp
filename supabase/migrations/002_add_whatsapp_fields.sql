-- Add recipient_phones to alert_configs
ALTER TABLE alert_configs ADD COLUMN IF NOT EXISTS recipient_phones text[] DEFAULT '{}';

-- Add sent_to_phones to alert_history
ALTER TABLE alert_history ADD COLUMN IF NOT EXISTS sent_to_phones text[] DEFAULT '{}';
