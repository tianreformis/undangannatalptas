-- Database schema for Perkantas Christmas Invitation
-- Run with: npx tsx scripts/migrate.ts (requires @neondatabase/serverless and dotenv)

-- Settings table: key-value store for all event configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- Seed default settings (idempotent)
INSERT INTO settings (key, value) VALUES
    ('title', 'Perayaan Natal'),
    ('theme', ''),
    ('greeting', 'Dengan sukacita kami mengundang Bapak/Ibu/Saudara/i untuk merayakan Natal bersama.'),
    ('verse_text', ''),
    ('verse_reference', ''),
    ('event_date', ''),
    ('event_time', ''),
    ('time_zone_label', 'WIB'),
    ('venue_name', ''),
    ('address', ''),
    ('maps_url', ''),
    ('dress_code', ''),
    ('contact_name', ''),
    ('contact_whatsapp', ''),
    ('rsvp_open', '0')
ON CONFLICT (key) DO NOTHING;

-- Rundown table: event schedule
CREATE TABLE IF NOT EXISTS rundown (
    id SERIAL PRIMARY KEY,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

-- Guests table: invited guests with unique slugs
CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    group_name TEXT,
    max_guests INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RSVPs table: guest responses
CREATE TABLE IF NOT EXISTS rsvps (
    id SERIAL PRIMARY KEY,
    guest_id INT UNIQUE NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('hadir', 'tidak_hadir')),
    attendees INT NOT NULL DEFAULT 1,
    message TEXT,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_rundown_sort ON rundown(sort_order);