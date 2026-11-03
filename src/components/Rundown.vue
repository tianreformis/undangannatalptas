<script setup lang="ts">
defineProps({
    rundown: { type: Array, default: () => [] },
})
</script>

<template>
    <section id="rundown" class="bg-cream-50 py-14 sm:py-16" aria-labelledby="rundown-title">
        <div class="section-shell">
            <header v-reveal class="text-center">
                <p class="eyebrow">Rangkaian acara</p>
                <h2 id="rundown-title" class="mt-2 font-serif text-3xl text-forest-900 sm:text-4xl">Rundown</h2>
                <div class="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"></div>
            </header>

            <ol class="mx-auto mt-10 max-w-xl border-l border-gold-500/40 pl-6 sm:pl-8">
                <li
                    v-for="(item, index) in rundown"
                    :key="`${item.time}-${index}`"
                    v-reveal="{ delay: index * 70 }"
                    class="timeline-dot relative pb-8 last:pb-0"
                >
                    <p v-if="item.time" class="font-sans text-[11px] font-medium uppercase tracking-widest text-gold-700">
                        {{ item.time }}
                    </p>
                    <p class="mt-1 font-serif text-xl leading-snug text-forest-900">{{ item.title }}</p>
                </li>
            </ol>
        </div>
    </section>
</template>