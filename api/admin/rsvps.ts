/**
 * Admin RSVP List API
 * GET /api/admin/rsvps - List all RSVPs with guest info, ordered by responded_at desc
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!requireAdmin(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const rows = await sql`
            SELECT g.name, g.group_name, g.slug, g.max_guests,
                   r.status, r.attendees, r.message, r.responded_at
            FROM rsvps r
            JOIN guests g ON g.id = r.guest_id
            ORDER BY r.responded_at DESC
        `;

        return res.status(200).json(rows.map(r => ({
            guestName: r.name,
            groupName: r.group_name,
            slug: r.slug,
            maxGuests: r.max_guests,
            status: r.status,
            attendees: r.attendees,
            message: r.message,
            respondedAt: r.responded_at,
        })));
    } catch (err) {
        console.error('GET /api/admin/rsvps error:', err);
        return res.status(500).json({ error: 'Gagal memuat daftar RSVP' });
    }
}