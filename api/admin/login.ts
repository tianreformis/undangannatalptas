/**
 * POST /api/admin/login
 * Body: { password }
 * Verifies password, sets signed session cookie.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClientIp, verifyPassword, checkLoginRateLimit, clearLoginAttempts, createSessionCookie, serializeSessionCookie, verifyOrigin } from '../_auth';

const EXPECTED_ORIGIN = process.env.VITE_SITE_URL ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CSRF protection: verify Origin
    if (!verifyOrigin(req, EXPECTED_ORIGIN)) {
        return res.status(403).json({ error: 'Origin tidak valid' });
    }

    const ip = getClientIp(req);

    // Rate limit login attempts
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimit.retryAfter} detik.`,
            retryAfter: rateLimit.retryAfter,
        });
    }

    // Small delay to slow down brute force
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

    try {
        const { password } = req.body ?? {};

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Password diperlukan' });
        }

        if (!verifyPassword(password)) {
            return res.status(401).json({ error: 'Password salah' });
        }

        // Success: clear attempts, create session
        clearLoginAttempts(ip);
        const sessionValue = createSessionCookie();
        const cookie = serializeSessionCookie(sessionValue);

        res.setHeader('Set-Cookie', cookie);
        return res.status(200).json({ success: true, message: 'Login berhasil' });
    } catch (err) {
        console.error('POST /api/admin/login error:', err);
        return res.status(500).json({ error: 'Gagal login' });
    }
}