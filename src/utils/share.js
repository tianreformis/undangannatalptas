import event from '../config/event'

/** URL dasar situs (menghormati base path Vite, mis. "/undangan/"). */
export function siteOrigin() {
  if (typeof window === 'undefined') return ''
  const base = import.meta.env.BASE_URL || '/'
  return `${window.location.origin}${base}`.replace(/\/+$/, '')
}

/** URL undangan untuk satu slug, opsional dengan nama hasil edit (?to=). */
export function buildInviteUrl(slug, name = '') {
  const base = siteOrigin()
  const path = slug ? `/${encodeURIComponent(slug)}` : '/'
  const query = name ? `?to=${encodeURIComponent(name)}` : ''
  return `${base}${path}${query}`
}

/** Nomor WhatsApp -> format internasional tanpa tanda baca. */
export function normalizeWhatsapp(number) {
  const digits = String(number ?? '').replace(/[^\d]/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

/** Link wa.me dengan pesan otomatis. */
export function whatsappLink(number, message) {
  const target = normalizeWhatsapp(number)
  if (!target) return ''
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`
}

/** Template pesan undangan yang siap dikirim lewat WhatsApp. */
export function buildInviteMessage({ name, link }) {
  const sapaan = name ? `Shalom ${name},` : 'Shalom,'
  return [
    sapaan,
    '',
    `Dengan penuh sukacita, kami mengundang${name ? ` ${name}` : ' Anda'} untuk hadir dalam ${event.organizer} — ${event.title}.`,
    'Silakan buka undangan digital berikut untuk melihat detail acaranya:',
    link,
    '',
    'Kirimkan konfirmasi kehadiran Anda melalui halaman undangan tersebut.',
    'Tuhan memberkati.',
  ].join('\n')
}

/** Pesan RSVP yang dikirim penerima undangan ke contact person. */
export function buildRsvpMessage({ name, attendance }) {
  const guest = name || 'Bapak/Ibu/Saudara/i'
  return [
    `Shalom, saya ${guest}.`,
    `Konfirmasi kehadiran untuk ${event.organizer} — ${event.title}: ${attendance}.`,
    '',
    'Terima kasih dan Tuhan memberkati.',
  ].join('\n')
}

/** Salin teks ke clipboard dengan fallback untuk browser lama / non-HTTPS. */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* lanjut ke fallback */
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
