/**
 * Admin authentication utilities for Vercel Serverless Functions.
 * Uses HMAC-SHA256 signed cookies with HttpOnly, Secure, SameSite=Strict.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters');
}
if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
}

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// In-memory login attempt tracking (best-effort, resets on cold start)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

/**
 * Sign a payload with HMAC-SHA256.
 */
function sign(payload: string): string {
    const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    return `${payload}.${signature}`;
}

/**
 * Verify a signed payload.
 */
function verify(signed: string): { valid: boolean; payload?: string } {
    const idx = signed.lastIndexOf('.');
    if (idx <= 0) return { valid: false };

    const payload = signed.slice(0, idx);
    const signature = signed.slice(idx + 1);
    const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
        return { valid: false };
    }

    return { valid: true, payload };
}

/**
 * Create a session cookie value.
 */
export function createSessionCookie(): string {
    const exp = Date.now() + SESSION_TTL_MS;
    return sign(`${exp}`);
}

/**
 * Parse and validate session cookie from request headers.
 * Returns { valid: true, exp } or { valid: false }.
 */
export function parseSessionCookie(cookieHeader: string | null): { valid: boolean; exp?: number } {
    if (!cookieHeader) return { valid: false };

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));

    if (!sessionCookie) return { valid: false };

    const value = sessionCookie.slice(COOKIE_NAME.length + 1);
    const verified = verify(value);

    if (!verified.valid || !verified.payload) return { valid: false };

    const exp = Number(verified.payload);
    if (isNaN(exp) || exp < Date.now()) return { valid: false };

    return { valid: true, exp };
}

/**
 * Serialize session cookie for Set-Cookie header.
 */
export function serializeSessionCookie(value: string, options: { maxAge?: number; expired?: boolean } = {}): string {
    const parts = [
        `${COOKIE_NAME}=${value}`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
    ];

    if (options.expired) {
        parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        parts.push('Max-Age=0');
    } else if (options.maxAge) {
        parts.push(`Max-Age=${options.maxAge}`);
    } else {
        parts.push(`Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`);
    }

    return parts.join('; ');
}

/**
 * Verify admin password using timingSafeEqual.
 */
export function verifyPassword(input: string): boolean {
    const inputBuf = Buffer.from(input, 'utf-8');
    const expectedBuf = Buffer.from(ADMIN_PASSWORD, 'utf-8');

    if (inputBuf.length !== expectedBuf.length) {
        // Still do a comparison to avoid timing leak on length
        timingSafeEqual(expectedBuf, expectedBuf);
        return false;
    }

    return timingSafeEqual(inputBuf, expectedBuf);
}

/**
 * Check and record login attempt for rate limiting.
 * Returns { allowed: boolean, retryAfter?: number }.
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const record = loginAttempts.get(ip);

    if (!record || now - record.firstAttempt > windowMs) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
        return { allowed: true };
    }

    if (record.count >= maxAttempts) {
        const retryAfter = Math.ceil((record.firstAttempt + windowMs - now) / 1000);
        return { allowed: false, retryAfter };
    }

    record.count++;
    return { allowed: true };
}

/**
 * Record successful login (clears attempt counter).
 */
export function clearLoginAttempts(ip: string): void {
    loginAttempts.delete(ip);
}

/**
 * Verify CSRF protection: check Origin/Host headers match expected.
 */
export function verifyOrigin(req: Request, expectedOrigin: string): boolean {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    // Allow same-origin or the expected origin
    if (origin === expectedOrigin) return true;
    if (host && origin === `https://${host}`) return true;

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) return true;

    return false;
}

/**
 * Get client IP from request headers (Vercel adds x-forwarded-for).
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') ?? 'unknown';
}