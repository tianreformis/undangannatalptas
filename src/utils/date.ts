const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN = /^(\d{1,2})[.:](\d{2})/

function pad(value) {
    return String(value).padStart(2, '0')
}

/**
 * Mengubah "YYYY-MM-DD" + "HH:MM" menjadi Date lokal.
 * Mengembalikan null bila format tidak valid — tidak pernah mengarang tanggal.
 */
export function parseEventDate(dateStr: string, timeStr: string = ''): Date | null {
    const match = DATE_PATTERN.exec(String(dateStr ?? '').trim())
    if (!match) return null

    const [, year, month, day] = match.map(Number)
    const test = new Date(year, month - 1, day)
    if (test.getFullYear() !== year || test.getMonth() !== month - 1 || test.getDate() !== day) return null

    const timeMatch = TIME_PATTERN.exec(String(timeStr ?? '').trim())
    if (timeMatch) {
        test.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0)
    } else {
        test.setHours(0, 0, 0, 0)
    }

    return test
}

/** "2026-12-20" -> "Minggu, 20 Desember 2026" (atau "" bila kosong/tidak valid). */
export function formatEventDate(event: { event_date?: string; time_zone_label?: string }): string {
    const date = parseEventDate(event.event_date ?? '', '')
    if (!date) return ''
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

/** Jam acara apa adanya dari event, mis. "18.00 WIB". */
export function formatEventTime(event: { event_time?: string; time_zone_label?: string }): string {
    const raw = String(event.event_time ?? '').trim()
    if (!raw) return ''
    return event.time_zone_label ? `${raw} ${event.time_zone_label}` : raw
}

function escapeIcsText(value: string): string {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
}

function toIcsStamp(date: Date): string {
    return (
        `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
        `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    )
}

function toUtcStamp(date: Date): string {
    return (
        `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
        `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    )
}

/** Membuat isi file .ics (kalender) dari data acara. */
export function buildIcsContent(event: any): string | null {
    const start = parseEventDate(event.event_date ?? '', event.event_time ?? '')
    if (!start) return null

    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const location = [event.venue_name, event.address].filter(Boolean).join(', ')
    const description = [
        `${event.organizer ?? 'Perkantas'} — ${event.title ?? 'Perayaan Natal'}`,
        event.theme,
        event.dress_code ? `Dress code: ${event.dress_code}` : '',
        event.contact_person?.name ? `Kontak: ${event.contact_person.name}` : '',
    ]
        .filter(Boolean)
        .join('\n')

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Perkantas//Undangan Natal//ID',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${toUtcStamp(new Date())}-${start.getTime()}@perkantas`,
        `DTSTAMP:${toUtcStamp(new Date())}`,
        `DTSTART:${toIcsStamp(start)}`,
        `DTEND:${toIcsStamp(end)}`,
        `SUMMARY:${escapeIcsText((event.organizer ?? 'Perkantas') + ' — ' + (event.title ?? 'Perayaan Natal'))}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        location ? `LOCATION:${escapeIcsText(location)}` : '',
        event.maps_url ? `URL:${event.maps_url}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
    ]
        .filter(Boolean)
        .join('\r\n')
}

/** Mengunduh file .ics (tombol "Simpan ke Kalender"). */
export function downloadIcs(event: any, filename = 'perkantas-natal.ics'): boolean {
    const content = buildIcsContent(event)
    if (!content) return false

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1500)
    return true
}