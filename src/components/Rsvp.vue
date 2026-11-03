<script setup>
import { computed, ref } from 'vue'
import event from '../config/event'
import { useGuestName } from '../composables/useGuestName'
import { buildRsvpMessage, whatsappLink } from '../utils/share'

const { displayName } = useGuestName()
const attendance = ref('Hadir')

const options = ['Hadir', 'Tidak hadir', 'Belum pasti']

const waHref = computed(() =>
  whatsappLink(
    event.contactPerson?.whatsapp,
    buildRsvpMessage({ name: displayName.value, attendance: attendance.value }),
  ),
)
</script>

<template>
  <section
    id="rsvp"
    class="relative overflow-hidden bg-burgundy-900 py-14 text-cream-100 sm:py-16"
    aria-labelledby="rsvp-title"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,39,0.18),_transparent_65%)]"
      aria-hidden="true"
    ></div>
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" aria-hidden="true"></div>

    <div class="section-shell relative z-10">
      <header v-reveal class="text-center">
        <p class="eyebrow text-gold-300/90">Konfirmasi kehadiran</p>
        <h2 id="rsvp-title" class="mt-2 font-serif text-3xl text-cream-50 sm:text-4xl">RSVP</h2>
        <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cream-100/70">
          Kehadiran Anda sangat berarti bagi kami. Mohon kirimkan konfirmasi melalui WhatsApp agar kami dapat
          mempersiapkan segala sesuatunya dengan baik.
        </p>
      </header>

      <div v-reveal="{ delay: 100 }" class="mx-auto mt-8 max-w-md rounded-3xl border border-gold-300/25 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
        <div class="rounded-2xl border border-gold-300/20 bg-forest-950/30 px-4 py-3 text-center">
          <p class="text-[10px] uppercase tracking-[0.22em] text-cream-200/65">Untuk</p>
          <p class="mt-1 font-serif text-lg leading-snug text-gold-100">{{ displayName }}</p>
        </div>

        <fieldset class="mt-5">
          <legend class="mb-2 text-xs uppercase tracking-widest text-cream-200/60">Kehadiran</legend>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="option in options"
              :key="option"
              type="button"
              class="min-h-[44px] rounded-xl border px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              :class="
                attendance === option
                  ? 'border-gold-400 bg-gold-400/20 text-gold-100'
                  : 'border-cream-200/15 bg-transparent text-cream-100/70 hover:border-cream-200/40'
              "
              :aria-pressed="attendance === option"
              @click="attendance = option"
            >
              {{ option }}
            </button>
          </div>
        </fieldset>

        <a :href="waHref" target="_blank" rel="noopener noreferrer" class="btn mt-5 w-full bg-[#25D366] font-semibold text-forest-950 hover:brightness-105">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.73.45 3.42 1.32 4.91L2 22l5.38-1.41a9.82 9.82 0 0 0 4.66 1.19h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.47 2 12.04 2zm5.75 13.9c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.92-1.15-4.77-4.14-4.91-4.33-.14-.19-1.17-1.56-1.17-2.98 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36l.55.01c.18 0 .41-.07.64.49.24.58.81 1.99.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48l-.44.5c-.14.14-.29.29-.12.58.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.09 1.67.79 1.96.93.29.14.48.22.55.34.07.12.07.7-.17 1.38z"
            />
          </svg>
          Konfirmasi Kehadiran via WhatsApp
        </a>

        <p v-if="event.contactPerson?.name" class="mt-3 text-center text-[11px] text-cream-200/65">
          Narahubung: {{ event.contactPerson.name }}
        </p>
      </div>
    </div>
  </section>
</template>
