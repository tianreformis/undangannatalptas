<script setup lang="ts">
defineProps({
    verse: { type: Object, default: () => ({ text: '', reference: '' }) },
})
</script>

<template>
    <section class="relative overflow-hidden bg-forest-900 py-14 text-cream-100 sm:py-16" aria-labelledby="verse-title">
        <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,39,0.14),_transparent_70%)]"
            aria-hidden="true"
        ></div>
        <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" aria-hidden="true"></div>

        <div class="section-shell relative z-10 text-center">
            <p id="verse-title" class="eyebrow text-gold-300/90">Ayat Firman</p>

            <div v-reveal class="mx-auto mt-6 max-w-xl">
                <svg class="mx-auto mb-3 h-6 w-6 text-gold-400/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                        d="M9.5 5.5C6.5 6.8 4.7 9.4 4.7 12.6c0 3.1 1.9 5.2 4.5 5.2 2.2 0 3.8-1.6 3.8-3.6 0-2-1.4-3.4-3.3-3.4-.3 0-.6 0-.9.1.4-1.5 1.6-2.7 3.3-3.5l-2-2zm9.3 0c-3 1.3-4.8 3.9-4.8 7.1 0 3.1 1.9 5.2 4.5 5.2 2.2 0 3.8-1.6 3.8-3.6 0-2-1.4-3.4-3.3-3.4-.3 0-.6 0-.9.1.4-1.5 1.6-2.7 3.3-3.5l-2-2z"
                    />
                </svg>

                <blockquote class="font-serif text-xl leading-relaxed text-cream-50 sm:text-2xl">
                    “{{ verse.text }}”
                </blockquote>

                <p v-if="verse.reference" class="mt-4 font-sans text-xs uppercase tracking-widest text-gold-300/80">
                    {{ verse.reference }}
                </p>

                <div class="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" aria-hidden="true"></div>
            </div>
        </div>
    </section>
</template>