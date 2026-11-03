<script setup>
defineProps({
    name: { type: String, default: '' },
    event: { type: Object, default: () => ({}) },
    guest: { type: Object, default: () => ({}) },
})
</script>

<template>
    <section class="relative overflow-hidden bg-cream-50 paper-grain">
        <div
            class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(201,162,39,0.18),_transparent_70%)]"
            aria-hidden="true"
        ></div>
        <div
            class="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-forest-200/30 blur-3xl"
            aria-hidden="true"
        ></div>

        <div class="section-shell relative z-10 pb-12 pt-12 text-center sm:pb-16 sm:pt-16">
            <svg v-reveal class="mx-auto h-6 w-6 text-gold-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
            </svg>

            <p v-reveal="{ delay: 60 }" class="eyebrow mt-4">Undangan {{ event?.organizer ?? 'Perkantas' }}</p>

            <h2
                v-reveal="{ delay: 120 }"
                class="mt-3 font-serif text-3xl leading-tight text-forest-900 sm:text-4xl"
            >
                {{ event?.title || 'Perayaan Natal' }}
            </h2>

            <p v-if="event?.theme" v-reveal="{ delay: 180 }" class="mt-2 font-display text-lg italic text-burgundy-700">
                {{ event.theme }}
            </p>

            <div v-reveal="{ delay: 220 }" class="mx-auto mt-7 flex max-w-md flex-col items-center gap-3">
                <span class="h-px w-24 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"></span>
                <p class="font-serif text-lg text-forest-900">
                    {{ event?.greeting ?? `Shalom, ${name}` }}
                </p>
                <p class="text-sm leading-relaxed text-forest-900/75">
                    {{ event?.greeting?.includes('mengundang') ? '' : `Kiranya sukacita dan damai Natal memenuhi rumah, keluarga, dan hati Anda.` }}
                </p>
            </div>
        </div>
    </section>
</template>