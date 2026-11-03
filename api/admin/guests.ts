/**
 * Admin Guests API
 * GET    /api/admin/guests                    - List guests with RSVP status (supports search, filter)
 * POST   /api/admin/guests                    - Create guest(s) (single or bulk)
 * PUT    /api/admin/guests?id=...             - Update guest
 * DELETE /api/admin/guests?id=...             - Delete guest
 * GET    /api/admin/guests/export             - Export CSV
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { requireAdmin } from '../_adminAuth';
import { generateUniqueSlug, slugify, normalizeGuestName } from '../_slug';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!requireAdmin(req, res)) return;

    const url = new URL(req.url ?? '', `https://${req.headers.host}`);
    const isExport = url.pathname.endsWith('/export');

    try {
        if (req.method === 'GET' && !isExport) {
            // List guests with RSVP status
            const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
            const filter = url.searchParams.get('filter') ?? 'all'; // all, hadir, tidak_hadir, belum

            let whereClause = '';
            const params: any[] = [];

            if (search) {
                whereClause += ` AND (g.name ILIKE $${params.length + 1} OR g.group_name ILIKE $${params.length + 1} OR g.slug ILIKE $${params.length + 1})`;
                params.push(`%${search}%`);
            }

            if (filter === 'hadir') {
                whereClause += ` AND r.status = 'hadir'`;
            } else if (filter === 'tidak_hadir') {
                whereClause += ` AND r.status = 'tidak_hadir'`;
            } else if (filter === 'belum') {
                whereClause += ` AND r.id IS NULL`;
            }

            const query = `
                SELECT g.id, g.slug, g.name, g.group_name, g.max_guests, g.created_at,
                       r.status, r.attendees, r.message, r.responded_at
                FROM guests g
                LEFT JOIN rsvps r ON r.guest_id = g.id
                WHERE 1=1 ${whereClause}
                ORDER BY g.created_at DESC
            `;

            const rows = await sql.unsafe(query, params);
            return res.status(200).json(rows.map(r => ({
                id: r.id,
                slug: r.slug,
                name: r.name,
                groupName: r.group_name,
                maxGuests: r.max_guests,
                createdAt: r.created_at,
                rsvp: r.status ? {
                    status: r.status,
                    attendees: r.attendees,
                    message: r.message,
                    respondedAt: r.responded_at,
                } : null,
            })));
        }

        if (req.method === 'GET' && isExport) {
            // Export CSV
            const rows = await sql`
                SELECT g.name, g.group_name, g.slug, g.max_guests,
                       r.status, r.attendees, r.message, r.responded_at
                FROM guests g
                LEFT JOIN rsvps r ON r.guest_id = g.id
                ORDER BY g.created_at DESC
            `;

            const siteUrl = process.env.VITE_SITE_URL ?? '';
            const headers = ['Nama', 'Kelompok', 'Link Undangan', 'Maks Tamu', 'Status', 'Jumlah Hadir', 'Pesan', 'Waktu Respons'];
            const csvRows = [headers.join(',')];

            for (const r of rows) {
                const link = siteUrl ? `${siteUrl.replace(/\/$/, '')}/${r.slug}` : r.slug;
                const statusMap: Record<string, string> = { hadir: 'Hadir', tidak_hadir: 'Tidak Hadir' };
                const status = r.status ? statusMap[r.status] : 'Belum Menjawab';
                const message = (r.message ?? '').replace(/"/g, '""');
                const row = [
                    `"${r.name}"`,
                    `"${r.group_name ?? ''}"`,
                    `"${link}"`,
                    r.max_guests,
                    `"${status}"`,
                    r.attendees ?? 0,
                    `"${message}"`,
                    r.responded_at ? new Date(r.responded_at).toLocaleString('id-ID') : '',
                ];
                csvRows.push(row.join(','));
            }

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="daftar-tamu-rsvp.csv"');
            return res.status(200).send(csvRows.join('\n'));
        }

        if (req.method === 'POST') {
            // Create guest(s)
            const body = req.body ?? {};

            // Support both single guest and bulk (array of names or objects)
            const guestsInput = Array.isArray(body.guests) ? body.guests :
                (body.name ? [{ name: body.name, groupName: body.groupName, maxGuests: body.maxGuests }] : []);

            if (guestsInput.length === 0) {
                return res.status(400).json({ error: 'Data tamu kosong' });
            }

            // Also support textarea bulk input (one name per line, optional "Name | Group | Max")
            if (body.bulkText && typeof body.bulkText === 'string') {
                const lines = body.bulkText.split('\n').map(l => l.trim()).filter(l => l);
                for (const line of lines) {
                    const parts = line.split('|').map(p => p.trim());
                    guestsInput.push({
                        name: parts[0],
                        groupName: parts[1] || undefined,
                        maxGuests: parts[2] ? parseInt(parts[2], 10) : undefined,
                    });
                }
            }

            const results = [];

            for (const input of guestsInput) {
                const name = normalizeGuestName(input.name ?? '');
                if (!name) continue;

                const groupName = input.groupName ? normalizeGuestName(input.groupName) : null;
                const maxGuests = Math.max(1, Math.min(20, Number(input.maxGuests) || 1));

                // Generate unique slug
                const slug = await generateUniqueSlug(name, async (s) => {
                    const rows = await sql`SELECT 1 FROM guests WHERE slug = ${s}`;
                    return rows.length > 0;
                });

                const rows = await sql`
                    INSERT INTO guests (slug, name, group_name, max_guests)
                    VALUES (${slug}, ${name}, ${groupName}, ${maxGuests})
                    RETURNING id, slug, name, group_name, max_guests
                `;

                results.push(rows[0]);
            }

            return res.status(201).json({ success: true, guests: results, count: results.length });
        }

        if (req.method === 'PUT') {
            const id = req.query.id as string;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID tidak valid' });
            }

            const { name, groupName, maxGuests, slug } = req.body ?? {};

            // Check if guest exists
            const existing = await sql`SELECT id, slug FROM guests WHERE id = ${Number(id)}`;
            if (existing.length === 0) {
                return res.status(404).json({ error: 'Tamu tidak ditemukan' });
            }

            const updates: string[] = [];
            const params: any[] = [Number(id)];
            let paramIdx = 2;

            if (name !== undefined) {
                const cleanName = normalizeGuestName(name);
                if (!cleanName) {
                    return res.status(400).json({ error: 'Nama tidak boleh kosong' });
                }
                updates.push(`name = $${paramIdx++}`);
                params.push(cleanName);
            }

            if (groupName !== undefined) {
                updates.push(`group_name = $${paramIdx++}`);
                params.push(groupName ? normalizeGuestName(groupName) : null);
            }

            if (maxGuests !== undefined) {
                const mg = Math.max(1, Math.min(20, Number(maxGuests) || 1));
                updates.push(`max_guests = $${paramIdx++}`);
                params.push(mg);
            }

            if (slug !== undefined) {
                const cleanSlug = slugify(slug);
                if (!cleanSlug) {
                    return res.status(400).json({ error: 'Slug tidak valid' });
                }
                // Check uniqueness
                const dup = await sql`SELECT 1 FROM guests WHERE slug = ${cleanSlug} AND id != $1`, [Number(id)];
                if (dup.length > 0) {
                    return res.status(409).json({ error: 'Slug sudah digunakan' });
                }
                updates.push(`slug = $${paramIdx++}`);
                params.push(cleanSlug);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'Tidak ada data yang diubah' });
            }

            const query = `UPDATE guests SET ${updates.join(', ')} WHERE id = $1 RETURNING id, slug, name, group_name, max_guests`;
            const rows = await sql.unsafe(query, params);

            return res.status(200).json({
                success: true,
                guest: rows[0],
            });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id as string;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID tidak valid' });
            }

            const rows = await sql`DELETE FROM guests WHERE id = ${Number(id)} RETURNING id`;

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Tamu tidak ditemukan' });
            }

            return res.status(200).json({ success: true, message: 'Tamu dihapus' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Admin guests error:', err);
        return res.status(500).json({ error: 'Gagal memproses permintaan' });
    }
}