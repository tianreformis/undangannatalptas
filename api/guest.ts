/**
 * GET /api/guest?slug=...
 * Returns guest info + existing RSVP if any.
 * 404 if slug not found.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const slug = req.query.slug as string;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Parameter slug diperlukan' });
    }

    try {
        // Find guest by slug
        const guestRows = await sql`
            SELECT id, slug, name, max_guests
            FROM guests
            WHERE slug = ${slug}
        `;

        if (guestRows.length === 0) {
            return res.status(404).json({ error: 'Tamu tidak ditemukan' });
        }

        const guest = guestRows[0];

        // Check for existing RSVP
        const rsvpRows = await sql`
            SELECT status, attendees, message, responded_at
            FROM rsvps
            WHERE guest_id = ${guest.id}
        `;

        const rsvp = rsvpRows.length > 0 ? rsvpRows[0] : null;

        return res.status(200).json({
            name: guest.name,
            maxGuests: guest.max_guests,
            rsvp: rsvp ? {
                status: rsvp.status,
                attendees: rsvp.attendees,
                message: rsvp.message,
                respondedAt: rsvp.responded_at,
            } : null,
        });
    } catch (err) {
        console.error('GET /api/guest error:', err);
        return res.status(500).json({ error: 'Gagal memuat data tamu' });
    }
}