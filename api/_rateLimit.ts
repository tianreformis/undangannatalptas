/**
 * Simple in-memory rate limiter for RSVP submissions.
 * Best-effort protection (resets on cold start).
 */

interface RateLimitRecord {
    count: number;
    firstRequest: number;
}

const rsvpAttempts = new Map<string, RateLimitRecord>();
const RSVP_WINDOW_MS = 60 * 1000; // 1 minute
const RSVP_MAX_REQUESTS = 20;

/**
 * Check rate limit for an IP.
 * Returns { allowed: boolean, retryAfter?: number }.
 */
export function checkRsvpRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = rsvpAttempts.get(ip);

    if (!record || now - record.firstRequest > RSVP_WINDOW_MS) {
        rsvpAttempts.set(ip, { count: 1, firstRequest: now });
        return { allowed: true };
    }

    if (record.count >= RSVP_MAX_REQUESTS) {
        const retryAfter = Math.ceil((record.firstRequest + RSVP_WINDOW_MS - now) / 1000);
        return { allowed: false, retryAfter };
    }

    record.count++;
    return { allowed: true };
}

/**
 * Sanitize message input: trim, remove control chars, limit length.
 */
export function sanitizeMessage(input: string, maxLen = 300): string {
    return input
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim()
        .slice(0, maxLen);
}

/**
 * Validate RSVP payload.
 * Returns { valid: boolean, errors: string[], data?: any }.
 */
export function validateRsvpPayload(body: any, guestMaxGuests: number): {
    valid: boolean;
    errors: string[];
    data?: { status: 'hadir' | 'tidak_hadir'; attendees: number; message: string };
} {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
        errors.push('Data tidak valid');
        return { valid: false, errors };
    }

    const { status, attendees, message } = body;

    // Status validation
    if (status !== 'hadir' && status !== 'tidak_hadir') {
        errors.push('Status kehadiran tidak valid (harus "hadir" atau "tidak_hadir")');
    }

    // Attendees validation
    const attendeesNum = Number(attendees);
    if (!Number.isInteger(attendeesNum) || attendeesNum < 0) {
        errors.push('Jumlah tamu harus bilangan bulat non-negatif');
    }

    if (status === 'hadir') {
        if (attendeesNum < 1) {
            errors.push('Minimal 1 orang untuk kehadiran');
        }
        if (attendeesNum > guestMaxGuests) {
            errors.push(`Maksimal ${guestMaxGuests} orang`);
        }
    } else {
        // For tidak_hadir, force attendees to 0
    }

    // Message validation
    let cleanMessage = '';
    if (message !== undefined && message !== null) {
        cleanMessage = sanitizeMessage(String(message));
        if (cleanMessage.length > 300) {
            errors.push('Pesan maksimal 300 karakter');
        }
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            status,
            attendees: status === 'hadir' ? attendeesNum : 0,
            message: cleanMessage,
        },
    };
}