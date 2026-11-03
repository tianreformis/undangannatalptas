/**
 * Nama penerima undangan.
 * Prioritas: query `?to=` > slug pada URL > sapaan umum.
 * (Fitur ubah nama dinonaktifkan; nama bersifat final saat link dikirim.)
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeGuestName, slugToName } from '../utils/slug'

export const FALLBACK_GREETING = 'Bapak/Ibu/Saudara/i'

export function useGuestName() {
  const route = useRoute()

  const nameFromQuery = computed(() => normalizeGuestName(route.query?.to))
  const nameFromSlug = computed(() => slugToName(route.params?.slug))
  const guestName = computed(() => nameFromQuery.value || nameFromSlug.value)
  const displayName = computed(() => guestName.value || FALLBACK_GREETING)
  const isPersonal = computed(() => Boolean(guestName.value))

  return {
    guestName,
    displayName,
    isPersonal,
    nameFromQuery,
    nameFromSlug,
  }
}
