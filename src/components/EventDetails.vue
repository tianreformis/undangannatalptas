<script setup>
import { computed } from 'vue'
import { downloadIcs, formatEventDate, formatEventTime, parseEventDate } from '../utils/date'
import Countdown from './Countdown.vue'

defineProps({
    event: { type: Object, default: () => ({}) },
})

const hasDate = computed(() => Boolean(props.event?.event_date && parseEventDate(props.event.event_date)))
const dateLabel = computed(() => formatEventDate(props.event) || 'Segera diinformasikan')
const timeLabel = computed(() => formatEventTime(props.event) || 'Segera diinformasikan')
const venueLabel = computed(() => props.event?.venue_name || 'Segera diinformasikan')
const hasLocation = computed(() => Boolean(props.event?.venue_name || props.event?.address))
const hasDressCode = computed(() => Boolean(props.event?.dress_code))

function saveToCalendar() {
    downloadIcs(props.event, 'undangan-natal-perkantas.ics')
}
</script>

<template>
    <section id="acara" class="relative bg-cream-100 py-14 sm:py-16" aria-labelledby="event-title">
        <div class="section-shell">
            <header v-reveal class="text-center">
                <p class="eyebrow">Simpan tanggalnya</p>
                <h2 id="event-title" class="mt-2 font-serif text-3xl text-forest-900 sm:text-4xl">Detail Acara</h2>
                <div class="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"></div>
            </header>

            <div class="mt-8 grid gap-4 sm:grid-cols-2">
                <article v-reveal="{ delay: 40 }" class="card flex items-start gap-4">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900/5 text-forest-700">
                        <svg
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
                            <path d="M8 3v4M16 3v4M3.5 10h17" />
                            <path d="M8 14h2M14 14h2M8 17.5h2M14 17.5h2" />
                        </svg>
                    </span>
                    <div class="min-w-0">
                        <p class="eyebrow text-forest-800/60">Tanggal</p>
                        <p v-if="hasDate" class="mt-1 font-serif text-lg leading-snug text-forest-900">{{ dateLabel }}</p>
                        <p v-else class="placeholder-text mt-1">{{ dateLabel }}</p>
                    </div>
                </article>

                <article v-reveal="{ delay: 100 }" class="card flex items-start gap-4">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900/5 text-forest-700">
                        <svg
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="8.5" />
                            <path d="M12 7.5V12l3 2" />
                        </svg>
                    </span>
                    <div class="min-w-0">
                        <p class="eyebrow text-forest-800/60">Waktu</p>
                        <p v-if="hasDate" class="mt-1 font-serif text-lg leading-snug text-forest-900">{{ timeLabel }}</p>
                        <p v-else class="placeholder-text mt-1">{{ timeLabel }}</p>
                    </div>
                </article>

                <article v-reveal="{ delay: 160 }" class="card flex items-start gap-4 sm:col-span-2">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900/5 text-forest-700">
                        <svg
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 12 4.2a6.5 6.5 0 0 0-6.5 6.5C5.5 15.4 12 21 12 21z" />
                            <circle cx="12" cy="10.6" r="2.4" />
                        </svg>
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="eyebrow text-forest-800/60">Lokasi</p>
                        <p v-if="event.venue_name" class="mt-1 font-serif text-lg leading-snug text-forest-900">
                            {{ venueLabel }}
                        </p>
                        <p v-else class="placeholder-text mt-1">{{ venueLabel }}</p>
                        <p v-if="event.address" class="mt-1 text-sm leading-relaxed text-forest-900/70">{{ event.address }}</p>
                        <p v-if="!hasLocation" class="mt-1 text-xs leading-relaxed text-forest-900/65">
                            Alamat lengkap akan kami sampaikan melalui narahubung.
                        </p>
                    </div>
                </article>
            </div>

            <div v-if="hasDate" v-reveal="{ delay: 80 }" class="mt-8">
                <Countdown :event="event" />
            </div>

            <div v-if="hasDate || event.maps_url" class="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                <a
                    v-if="event.maps_url"
                    :href="event.maps_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-outline-dark"
                >
                    <svg
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 12 4.2a6.5 6.5 0 0 0-6.5 6.5C5.5 15.4 12 21 12 21z" />
                        <circle cx="12" cy="10.6" r="2.4" />
                    </svg>
                    Buka Lokasi di Google Maps
                </a>

                <button v-if="hasDate" type="button" class="btn btn-outline-dark" @click="saveToCalendar">
                    <svg
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
                        <path d="M8 3v4M16 3v4M3.5 10h17" />
                        <path d="M12 13v4M10 15h4" />
                    </svg>
                    Simpan ke Kalender
                </button>
            </div>

            <div v-if="hasDressCode" v-reveal class="mx-auto mt-6 max-w-md rounded-2xl border border-gold-500/25 bg-gold-50/60 px-5 py-4 text-center">
                <p class="eyebrow text-gold-700">Dress code</p>
                <p class="mt-1 font-serif text-lg text-forest-900">{{ event.dress_code }}</p>
            </div>

            <p v-else-if="!hasDate && !event.maps_url" v-reveal class="mt-6 text-center text-xs leading-relaxed text-forest-900/65">
                Detail waktu dan lokasi akan segera diinformasikan melalui narahubung.
            </p>
        </div>
    </section>
</template>