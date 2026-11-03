/**
 * POST /api/rsvp
 * Body: { slug, status, attendees, message }
 * Validates and upserts RSVP.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { getClientIp } from './_auth';
import { checkRsvpRateLimit, validateRsvpPayload } from './_rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = getClientIp(req);

    // Rate limit check
    const rateLimit = checkRsvpRateLimit(ip);
    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa detik.',
            retryAfter: rateLimit.retryAfter,
        });
    }

    try {
        const body = req.body;

        if (!body || typeof body !== 'object') {
            return res.status(400).json({ error: 'Data tidak valid' });
        }

        const { slug, status, attendees, message } = body;

        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({ error: 'Slug tamu diperlukan' });
        }

        // Find guest
        const guestRows = await sql`
            SELECT id, max_guests
            FROM guests
            WHERE slug = ${slug}
        `;

        if (guestRows.length === 0) {
            return res.status(404).json({ error: 'Tamu tidak ditemukan' });
        }

        const guest = guestRows[0];

        // Check if RSVP is open
        const settingsRows = await sql`SELECT value FROM settings WHERE key = 'rsvp_open'`;
        const rsvpOpen = settingsRows.length > 0 && settingsRows[0].value === '1';

        if (!rsvpOpen) {
            return res.status(403).json({ error: 'Konfirmasi kehadiran telah ditutup' });
        }

        // Validate payload
        const validation = validateRsvpPayload({ status, attendees, message }, guest.max_guests);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join('; ') });
        }

        const { status: validStatus, attendees: validAttendees, message: validMessage } = validation.data!;

        // Upsert RSVP
        await sql`
            INSERT INTO rsvps (guest_id, status, attendees, message)
            VALUES (${guest.id}, ${validStatus}, ${validAttendees}, ${validMessage})
            ON CONFLICT (guest_id) DO UPDATE SET
                status = EXCLUDED.status,
                attendees = EXCLUDED.attendees,
                message = EXCLUDED.message,
                responded_at = now()
        `;

        return res.status(200).json({
            success: true,
            message: 'Konfirmasi kehadiran tersimpan',
            rsvp: {
                status: validStatus,
                attendees: validAttendees,
                message: validMessage,
            },
        });
    } catch (err) {
        console.error('POST /api/rsvp error:', err);
        return res.status(500).json({ error: 'Gagal menyimpan konfirmasi kehadiran' });
    }
}