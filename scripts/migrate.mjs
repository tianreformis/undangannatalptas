#!/usr/bin/env node
/**
 * Database migration script for Perkantas Christmas Invitation.
 * Reads schema from db/schema.sql and executes against Neon database.
 *
 * Usage:
 *   node scripts/migrate.mjs          # requires DATABASE_URL in .env
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌  DATABASE_URL tidak ditemukan. Pastikan .env berisi DATABASE_URL=...');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

const schemaPath = resolve(__dirname, '../db/schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

const rawStatements = schema.split(';');
const statements = [];
for (const stmt of rawStatements) {
    const lines = stmt
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('--'));
    const cleaned = lines.join('\n').trim();
    if (cleaned.length > 0) {
        statements.push(cleaned);
    }
}

console.log(`🔄  Menjalankan migrasi database (${statements.length} statements)...`);

for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const firstLine = stmt.split('\n')[0].slice(0, 80);
    console.log(`[${i+1}/${statements.length}] ⏳ ${firstLine}...`);
    await sql(stmt);
    console.log(`[${i+1}/${statements.length}] ✓ ${firstLine}...`);
}

console.log('✅  Migrasi selesai.');