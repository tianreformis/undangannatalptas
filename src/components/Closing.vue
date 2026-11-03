<script setup lang="ts">
defineProps({
    organizer: { type: String, default: 'Perkantas' },
})
</script>

<template>
    <footer class="relative overflow-hidden bg-forest-950 pb-10 pt-14 text-cream-100 sm:pt-16">
        <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(85,20,29,0.45),_transparent_70%)]"
            aria-hidden="true"
        ></div>
        <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" aria-hidden="true"></div>

        <div class="section-shell relative z-10 text-center">
            <svg v-reveal class="mx-auto h-6 w-6 text-gold-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
            </svg>

            <div v-reveal="{ delay: 80 }">
                <p class="mt-5 font-serif text-2xl text-cream-50 sm:text-3xl">Immanuel — Allah beserta kita</p>
                <p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream-100/65">
                    Terima kasih atas doa, dukungan, dan kasih Anda. Kiranya Natal membawa damai sejahtera bagi kita semua.
                </p>
            </div>

            <div v-reveal="{ delay: 140 }" class="mt-10">
                <div class="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent"></div>
                <p class="mt-6 pl-[0.3em] font-serif text-lg tracking-[0.3em] text-gold-200">{{ organizer }}</p>
                <p class="mt-1 text-[10px] uppercase tracking-[0.28em] text-cream-200/55">
                    Indonesia
                </p>
            </div>
        </div>
    </footer>
</template>