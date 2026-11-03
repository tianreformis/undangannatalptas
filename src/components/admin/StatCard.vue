<script setup lang="ts">
interface Props {
    label: string
    value: number | string
    icon: 'users' | 'user-plus' | 'check-circle' | 'x-circle' | 'clock'
    color: 'gold' | 'green' | 'red' | 'orange' | 'blue'
    subValue?: string
}

defineProps<Props>()
defineEmits<{ click: [] }>()

const icons = {
    users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />',
    'user-plus': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />',
    'check-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
    'x-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />',
    clock: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />',
}

const colors = {
    gold: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
</script>

<template>
    <button
        type="button"
        @click="$emit('click')"
        class="card group bg-forest-900/50 border-forest-700/50 p-4 text-left transition hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 cursor-pointer"
    >
        <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
                <p class="text-xs font-medium uppercase tracking-wider text-forest-300/70">{{ label }}</p>
                <p class="mt-1 font-serif text-3xl font-bold text-cream-50">{{ value }}</p>
                <p v-if="subValue" class="mt-1 text-xs text-forest-300/60">{{ subValue }}</p>
            </div>
            <div
                :class="['flex-shrink-0 p-3 rounded-xl', colors[color]]"
                aria-hidden="true"
            >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="icons[icon]" />
            </div>
        </div>
    </button>
</template>