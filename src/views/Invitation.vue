<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch, watchEffect, onMounted } from 'vue'
import { useGuestName } from '../composables/useGuestName'
import { useRoute } from 'vue-router'
import Cover from '../components/Cover.vue'
import Hero from '../components/Hero.vue'
import EventDetails from '../components/EventDetails.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import SnowEffect from '../components/SnowEffect.vue'
import RsvpForm from '../components/RsvpForm.vue'

const VerseSection = defineAsyncComponent(() => import('../components/Verse.vue'))
const RundownSection = defineAsyncComponent(() => import('../components/Rundown.vue'))
const ClosingSection = defineAsyncComponent(() => import('../components/Closing.vue'))

const route = useRoute()
const { guestName, displayName, isPersonal, nameFromSlug } = useGuestName()

const opened = ref(false)
const musicPlayer = ref(null)

const eventData = ref<any>(null)
const guestData = ref<{ name: string; maxGuests: number; rsvp: any } | null>(null)
const loadingEvent = ref(true)
const loadingGuest = ref(true)
const eventError = ref<string | null>(null)

async function fetchEvent() {
    try {
        const res = await fetch('/api/event')
        if (!res.ok) throw new Error('Gagal memuat data acara')
        eventData.value = await res.json()
    } catch (err) {
        console.error(err)
        eventError.value = 'Gagal memuat data acara. Silakan refresh halaman.'
    } finally {
        loadingEvent.value = false
    }
}

async function fetchGuest() {
    const slug = route.params.slug as string
    if (!slug) return

    try {
        const res = await fetch(`/api/guest?slug=${encodeURIComponent(slug)}`)
        if (res.ok) {
            guestData.value = await res.json()
        } else if (res.status === 404) {
            guestData.value = { name: '', maxGuests: 1, rsvp: null }
        }
    } catch (err) {
        console.error(err)
    } finally {
        loadingGuest.value = false
    }
}

onMounted(() => {
    fetchEvent()
    fetchGuest()
})

const hasVerse = computed(() => Boolean(eventData.value?.verse?.text))
const hasRundown = computed(() => Array.isArray(eventData.value?.rundown) && eventData.value.rundown.length > 0)
const hasRsvp = computed(() => eventData.value?.rsvpOpen === true && guestData.value !== null)

function openInvitation() {
    opened.value = true
    musicPlayer.value?.play()
    window.scrollTo({ top: 0, behavior: 'auto' })
}

watch(
    opened,
    (isOpen) => {
        document.body.classList.toggle('is-locked', !isOpen)
    },
    { immediate: true },
)

watchEffect(() => {
    const title = eventData.value?.title ?? 'Perayaan Natal'
    const organizer = eventData.value?.organizer ?? 'Perkantas'
    document.title = isPersonal.value
        ? `${displayName.value} — Undangan ${title} ${organizer}`
        : `Undangan ${title} — ${organizer}`
})

onBeforeUnmount(() => {
    document.body.classList.remove('is-locked')
})
</script>

<template>
    <div id="undangan" class="min-h-screen bg-cream-50">
        <SnowEffect />

        <Transition name="cover-fade">
            <Cover
                v-if="!opened"
                :name="displayName"
                :is-personal="isPersonal"
                @open="openInvitation"
            />
        </Transition>

        <Transition name="section-fade" appear>
            <main v-if="opened" class="relative z-10">
                <div v-if="loadingEvent" class="section-shell py-12 text-center">
                    <svg class="mx-auto h-8 w-8 animate-spin text-gold-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p class="mt-3 text-forest-600">Memuat undangan...</p>
                </div>

                <div v-else-if="eventError" class="section-shell py-12 text-center">
                    <svg class="mx-auto h-12 w-12 text-burgundy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="mt-3 text-forest-600">{{ eventError }}</p>
                </div>

                <div v-else>
                    <h1 class="sr-only">Undangan {{ eventData?.title }} {{ eventData?.organizer }}</h1>
                    <Hero :name="displayName" :event="eventData" :guest="guestData" />

                    <VerseSection v-if="hasVerse" :verse="eventData?.verse" />
                    <EventDetails v-if="eventData" :event="eventData" />
                    <RundownSection v-if="hasRundown" :rundown="eventData?.rundown" />

                    <RsvpForm
                        v-if="hasRsvp"
                        :slug="route.params.slug as string"
                        :max-guests="guestData?.maxGuests ?? 1"
                        :rsvp-open="eventData?.rsvpOpen ?? false"
                        :existing-rsvp="guestData?.rsvp ?? null"
                    />

                    <ClosingSection :organizer="eventData?.organizer" />
                </div>
            </main>
        </Transition>

        <MusicPlayer ref="musicPlayer" :visible="opened" :music-url="eventData?.music ?? '/audio/natal-instrumental.mp3'" />
    </div>
</template>