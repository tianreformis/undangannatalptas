#!/usr/bin/env npx tsx
/**
 * Database migration script for Perkantas Christmas Invitation.
 * Reads schema from db/schema.sql and executes against Neon database.
 *
 * Usage:
 *   npm run migrate          # requires DATABASE_URL in .env
 *   npx tsx scripts/migrate.ts
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

async function migrate() {
    const schemaPath = resolve(__dirname, '../db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('🔄  Menjalankan migrasi database...');

    try {
        // Split by semicolon
        const rawStatements = schema.split(';');
        const statements = [];

        for (const stmt of rawStatements) {
            // Remove comment lines (starting with --) and trim
            const lines = stmt
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0 && !l.startsWith('--'));
            const cleaned = lines.join('\n').trim();

            if (cleaned.length > 0) {
                statements.push(cleaned);
            }
        }

        console.log(`   Ditemukan ${statements.length} statement(s) untuk dieksekusi`);

        for (const stmt of statements) {
            const firstLine = stmt.split('\n')[0].slice(0, 80);
            console.log(`   ⏳  ${firstLine}...`);
            await sql(stmt);
            console.log(`   ✓  ${firstLine}...`);
        }

        console.log('✅  Migrasi selesai.');
    } catch (err) {
        console.error('❌  Migrasi gagal:', err);
        process.exit(1);
    }
}

migrate();