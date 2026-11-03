/**
 * GET /api/admin/settings - Get all settings (admin)
 * PUT /api/admin/settings - Update all settings (admin)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { requireAdmin } from '../_adminAuth';

const SETTINGS_KEYS = [
    'title', 'theme', 'greeting', 'verse_text', 'verse_reference',
    'event_date', 'event_time', 'time_zone_label',
    'venue_name', 'address', 'maps_url',
    'dress_code', 'contact_name', 'contact_whatsapp',
    'rsvp_open'
] as const;

type SettingsKey = typeof SETTINGS_KEYS[number];

function validateSettings(input: Record<string, any>): { valid: boolean; errors: string[]; data: Record<string, string> } {
    const errors: string[] = [];
    const data: Record<string, string> = {};

    for (const key of SETTINGS_KEYS) {
        const value = input[key] ?? '';

        // Specific validations
        if (key === 'event_date' && value) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                errors.push('Format tanggal harus YYYY-MM-DD');
            } else {
                // Validate it's a real date
                const date = new Date(value + 'T00:00:00');
                if (isNaN(date.getTime())) {
                    errors.push('Tanggal tidak valid');
                }
            }
        }

        if (key === 'event_time' && value) {
            if (!/^\d{2}:\d{2}$/.test(value)) {
                errors.push('Format waktu harus HH:mm (24 jam)');
            }
        }

        if (key === 'maps_url' && value) {
            if (!value.startsWith('https://')) {
                errors.push('Link Google Maps harus menggunakan HTTPS');
            }
        }

        if (key === 'contact_whatsapp' && value) {
            const digits = value.replace(/\D/g, '');
            if (!/^62\d{8,}$/.test(digits)) {
                errors.push('Nomor WhatsApp harus format Indonesia (62xxxxxxxxx)');
            }
            data[key] = digits; // Store normalized
            continue;
        }

        if (key === 'rsvp_open') {
            data[key] = value === '1' || value === true ? '1' : '0';
            continue;
        }

        data[key] = String(value).trim();
    }

    return { valid: errors.length === 0, errors, data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'GET') {
        try {
            const rows = await sql`SELECT key, value FROM settings`;
            const settings: Record<string, string> = {};
            for (const row of rows) {
                settings[row.key] = row.value;
            }
            // Ensure all keys present
            for (const key of SETTINGS_KEYS) {
                if (!(key in settings)) settings[key] = '';
            }
            return res.status(200).json(settings);
        } catch (err) {
            console.error('GET /api/admin/settings error:', err);
            return res.status(500).json({ error: 'Gagal memuat pengaturan' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const validation = validateSettings(req.body ?? {});

            if (!validation.valid) {
                return res.status(400).json({ error: validation.errors.join('; ') });
            }

            // Update all settings in a transaction-like manner
            for (const [key, value] of Object.entries(validation.data)) {
                await sql`
                    INSERT INTO settings (key, value)
                    VALUES (${key}, ${value})
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                `;
            }

            return res.status(200).json({ success: true, message: 'Pengaturan disimpan' });
        } catch (err) {
            console.error('PUT /api/admin/settings error:', err);
            return res.status(500).json({ error: 'Gagal menyimpan pengaturan' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}