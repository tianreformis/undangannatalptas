/**
 * Admin authentication middleware for Vercel Serverless Functions.
 * Verifies session cookie and returns 401 if invalid.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseSessionCookie, verifyOrigin } from './_auth';

const EXPECTED_ORIGIN = process.env.VITE_SITE_URL ?? '';

export interface AdminRequest extends VercelRequest {
    admin?: { authenticated: boolean };
}

/**
 * Middleware to require admin authentication.
 * Returns false and sends 401 response if not authenticated.
 */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const cookieHeader = req.headers.cookie ?? req.headers.Cookie ?? null;
    const session = parseSessionCookie(cookieHeader);

    if (!session.valid) {
        res.status(401).json({ error: 'Tidak terautentikasi. Silakan login.' });
        return false;
    }

    // For mutating requests, verify Origin
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method ?? '')) {
        if (!verifyOrigin(req, EXPECTED_ORIGIN)) {
            res.status(403).json({ error: 'Origin tidak valid (CSRF protection)' });
            return false;
        }
    }

    (req as AdminRequest).admin = { authenticated: true };
    return true;
}

/**
 * Get session expiry from request (for UI to show remaining time).
 */
export function getSessionExpiry(req: VercelRequest): number | null {
    const cookieHeader = req.headers.cookie ?? req.headers.Cookie ?? null;
    const session = parseSessionCookie(cookieHeader);
    return session.valid && session.exp ? session.exp : null;
}