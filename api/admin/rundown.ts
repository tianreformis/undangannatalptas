/**
 * Admin Rundown API
 * GET    /api/admin/rundown           - List all rundown items
 * POST   /api/admin/rundown           - Create new rundown item
 * PUT    /api/admin/rundown?id=...    - Update rundown item
 * DELETE /api/admin/rundown?id=...    - Delete rundown item
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!requireAdmin(req, res)) return;

    try {
        if (req.method === 'GET') {
            const rows = await sql`
                SELECT id, time, title, sort_order
                FROM rundown
                ORDER BY sort_order ASC, id ASC
            `;
            return res.status(200).json(rows.map(r => ({
                id: r.id,
                time: r.time,
                title: r.title,
                sortOrder: r.sort_order,
            })));
        }

        if (req.method === 'POST') {
            const { time, title, sortOrder } = req.body ?? {};

            if (!time || !title) {
                return res.status(400).json({ error: 'Waktu dan kegiatan wajib diisi' });
            }

            const nextOrder = typeof sortOrder === 'number' ? sortOrder : 0;

            const rows = await sql`
                INSERT INTO rundown (time, title, sort_order)
                VALUES (${time.trim()}, ${title.trim()}, ${nextOrder})
                RETURNING id, time, title, sort_order
            `;

            return res.status(201).json({
                id: rows[0].id,
                time: rows[0].time,
                title: rows[0].title,
                sortOrder: rows[0].sort_order,
            });
        }

        if (req.method === 'PUT') {
            const id = req.query.id as string;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID tidak valid' });
            }

            const { time, title, sortOrder } = req.body ?? {};

            if (!time || !title) {
                return res.status(400).json({ error: 'Waktu dan kegiatan wajib diisi' });
            }

            const rows = await sql`
                UPDATE rundown
                SET time = ${time.trim()}, title = ${title.trim()}, sort_order = ${typeof sortOrder === 'number' ? sortOrder : 0}
                WHERE id = ${Number(id)}
                RETURNING id, time, title, sort_order
            `;

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Item tidak ditemukan' });
            }

            return res.status(200).json({
                id: rows[0].id,
                time: rows[0].time,
                title: rows[0].title,
                sortOrder: rows[0].sort_order,
            });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id as string;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID tidak valid' });
            }

            const rows = await sql`DELETE FROM rundown WHERE id = ${Number(id)} RETURNING id`;

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Item tidak ditemukan' });
            }

            return res.status(200).json({ success: true, message: 'Item dihapus' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Admin rundown error:', err);
        return res.status(500).json({ error: 'Gagal memproses permintaan' });
    }
}