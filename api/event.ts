/**
 * GET /api/event
 * Returns all public event settings + rundown.
 * Cached for 30s with stale-while-revalidate 60s.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch all settings
        const settingsRows = await sql`SELECT key, value FROM settings`;
        const settings: Record<string, string> = {};
        for (const row of settingsRows) {
            settings[row.key] = row.value;
        }

        // Fetch rundown ordered by sort_order
        const rundownRows = await sql`
            SELECT id, time, title, sort_order
            FROM rundown
            ORDER BY sort_order ASC, id ASC
        `;

        const rundown = rundownRows.map(r => ({
            id: r.id,
            time: r.time,
            title: r.title,
        }));

        // Build response
        const response = {
            title: settings.title ?? 'Perayaan Natal',
            theme: settings.theme ?? '',
            greeting: settings.greeting ?? 'Dengan sukacita kami mengundang Bapak/Ibu/Saudara/i untuk merayakan Natal bersama.',
            verse: {
                text: settings.verse_text ?? '',
                reference: settings.verse_reference ?? '',
            },
            date: settings.event_date ?? '',
            time: settings.event_time ?? '',
            timeZoneLabel: settings.time_zone_label ?? 'WIB',
            venueName: settings.venue_name ?? '',
            address: settings.address ?? '',
            mapsUrl: settings.maps_url ?? '',
            dressCode: settings.dress_code ?? '',
            contactPerson: {
                name: settings.contact_name ?? '',
                whatsapp: settings.contact_whatsapp ?? '',
            },
            rsvpOpen: settings.rsvp_open === '1',
            rundown,
        };

        // Cache headers: 30s fresh, 60s stale-while-revalidate
        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        return res.status(200).json(response);
    } catch (err) {
        console.error('GET /api/event error:', err);
        return res.status(500).json({ error: 'Gagal memuat data acara' });
    }
}