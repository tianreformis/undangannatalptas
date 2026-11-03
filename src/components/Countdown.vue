<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { parseEventDate } from '../utils/date'

defineProps({
    event: { type: Object, default: () => ({}) },
})

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const target = computed(() => {
    const date = parseEventDate(props.event?.event_date ?? '', props.event?.event_time ?? '')
    if (!date) return null
    // Bila jam belum diisi, hitung mundur sampai akhir hari tersebut.
    if (!props.event?.event_time) date.setHours(23, 59, 59, 999)
    return date
})

const remaining = computed(() => {
    if (!target.value) return 0
    return Math.max(0, target.value.getTime() - now.value)
})

const parts = computed(() => {
    const total = Math.floor(remaining.value / 1000)
    return {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    }
})

const items = computed(() => [
    { label: 'Hari', value: parts.value.days },
    { label: 'Jam', value: parts.value.hours },
    { label: 'Menit', value: parts.value.minutes },
    { label: 'Detik', value: parts.value.seconds },
])

const isPast = computed(() => remaining.value <= 0)

function pad(value: number) {
    return String(value).padStart(2, '0')
}

onMounted(() => {
    timer = window.setInterval(() => {
        now.value = Date.now()
    }, 1000)
})

onBeforeUnmount(() => {
    if (timer) window.clearInterval(timer)
})
</script>

<template>
    <div v-if="target" class="text-center">
        <p v-if="isPast" class="font-serif text-base italic text-forest-800/70">
            Acara telah berlangsung. Terima kasih atas doa dan dukungan Anda.
        </p>

        <div v-else>
            <p class="eyebrow mb-3">Menuju hari perayaan</p>
            <div class="flex items-stretch justify-center gap-2 sm:gap-3" aria-hidden="true">
                <div
                    v-for="item in items"
                    :key="item.label"
                    class="min-w-[64px] flex-1 rounded-xl border border-gold-500/25 bg-white/70 px-2 py-3 shadow-sm sm:max-w-[92px]"
                >
                    <span class="block font-serif text-2xl leading-none text-forest-900 tabular-nums sm:text-3xl">
                        {{ item.label === 'Hari' ? item.value : pad(item.value) }}
                    </span>
                    <span class="mt-1 block text-[10px] uppercase tracking-widest text-forest-800/60">{{ item.label }}</span>
                </div>
            </div>
            <p class="sr-only">
                Hitung mundur menuju acara: {{ parts.days }} hari, {{ parts.hours }} jam, {{ parts.minutes }} menit,
                {{ parts.seconds }} detik.
            </p>
        </div>
    </div>
</template>