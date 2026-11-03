/**
 * Slug utilities shared between frontend and API.
 */

const FORBIDDEN_SLUGS = new Set(['admin', 'api', 'generator', 'assets', 'images', 'audio', 'favicon', 'og-image']);

/**
 * Normalize a guest name for display (trim, collapse whitespace).
 */
export function normalizeGuestName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
}

/**
 * Convert a string to a URL-safe slug.
 * Lowercase, replace spaces with -, remove special chars, remove accents.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, space, hyphen
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-|-$/g, ''); // Trim hyphens
}

/**
 * Generate a unique slug for a guest.
 * If base slug exists or is forbidden, append -2, -3, etc.
 */
export async function generateUniqueSlug(
    baseName: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let baseSlug = slugify(baseName);

    if (!baseSlug) baseSlug = 'tamu';

    // Check forbidden slugs
    if (FORBIDDEN_SLUGS.has(baseSlug)) {
        baseSlug = `tamu-${baseSlug}`;
    }

    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        counter++;
        slug = `${baseSlug}-${counter}`;
    }

    return slug;
}

/**
 * Convert slug back to display name (Title Case).
 */
export function slugToName(slug: string): string {
    return slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}