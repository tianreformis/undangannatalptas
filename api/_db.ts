/**
 * Neon database client for Vercel Serverless Functions.
 * Uses the HTTP driver (@neondatabase/serverless) which works in edge/serverless environments.
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Tagged template literal for parameterized queries
export const sql = neon(DATABASE_URL);

/**
 * Helper to execute a single query with parameters.
 * Usage: await query`SELECT * FROM guests WHERE slug = ${slug}`;
 */
export async function query<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> {
    return sql(strings, ...values) as Promise<T[]>;
}

/**
 * Helper for single row result.
 */
export async function queryOne<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T | null> {
    const rows = await sql(strings, ...values) as T[];
    return rows[0] ?? null;
}

/**
 * Helper for insert/update/delete returning affected count.
 */
export async function exec(strings: TemplateStringsArray, ...values: any[]): Promise<number> {
    const result = await sql(strings, ...values) as any[];
    return result.length;
}