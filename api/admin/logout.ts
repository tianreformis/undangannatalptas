/**
 * POST /api/admin/logout
 * Clears the session cookie.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serializeSessionCookie } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const cookie = serializeSessionCookie('', { expired: true });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, message: 'Logout berhasil' });
}