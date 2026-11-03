/** Partikel nama yang tetap huruf kecil di tengah nama (mis. "Kak Maria dan Pasangan"). */
const NAME_PARTICLES = new Set(['dan', 'di', 'ke', 'dari', 'bin', 'binti', 'van', 'de', 'der', 'al'])

/** decodeURIComponent yang tidak pernah melempar error untuk input rusak. */
export function decodeSlugSafely(value) {
  const raw = String(value ?? '')
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** Membersihkan nama yang diketik pengguna / dibaca dari query. */
export function normalizeGuestName(value) {
  const single = Array.isArray(value) ? value[0] : value
  return decodeSlugSafely(single).replace(/\+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
}

/** `budi-santoso` -> `Budi Santoso` (Title Case). */
export function slugToName(slug) {
  const decoded = decodeSlugSafely(slug)
    .replace(/\+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!decoded) return ''

  return decoded
    .split(' ')
    .map((word, index, words) => {
      const lower = word.toLocaleLowerCase('id-ID')
      if (index > 0 && index < words.length - 1 && NAME_PARTICLES.has(lower)) return lower
      return lower.charAt(0).toLocaleUpperCase('id-ID') + lower.slice(1)
    })
    .join(' ')
}

/** `Budi Santoso` -> `budi-santoso` */
export function nameToSlug(name) {
  return String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
