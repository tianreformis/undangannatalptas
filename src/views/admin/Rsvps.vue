<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface RsvpItem {
    guestName: string
    groupName: string | null
    slug: string
    maxGuests: number
    status: 'hadir' | 'tidak_hadir'
    attendees: number
    message: string
    respondedAt: string
}

const items = ref<RsvpItem[]>([])
const loading = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    tidak_hadir: 'Tidak Hadir',
}
const statusColors: Record<string, string> = {
    hadir: 'bg-green-500/20 text-green-400 border-green-500/30',
    tidak_hadir: 'bg-red-500/20 text-red-400 border-red-500/30',
}

async function fetchRsvps() {
    try {
        loading.value = true
        const res = await fetch('/api/admin/rsvps')
        if (!res.ok) throw new Error('Gagal memuat data')
        items.value = await res.json()
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal memuat daftar RSVP' }
    } finally {
        loading.value = false
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

onMounted(fetchRsvps)
</script>

<template>
    <div class="space-y-6">
        <header>
            <h1 class="font-serif text-2xl sm:text-3xl text-cream-50">Daftar RSVP</h1>
            <p class="text-forest-300/70 mt-1">Daftar konfirmasi kehadiran dari tamu</p>
        </header>

        <div v-if="message" :class="['p-4 rounded-lg flex items-center gap-3', message.type === 'success' ? 'bg-green-900/50 border border-green-700/50 text-green-100' : 'bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100']">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="message.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ message.text }}
        </div>

        <div class="card bg-forest-900/50 border-forest-700/50 overflow-hidden">
            <div v-if="loading" class="p-8 text-center text-forest-300/60">
                <svg class="animate-spin mx-auto h-8 w-8 text-gold-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p class="mt-3 font-medium text-cream-50">Memuat data RSVP...</p>
            </div>

            <div v-else-if="items.length === 0" class="p-8 text-center text-forest-300/60">
                <svg class="mx-auto h-12 w-12 text-forest-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="font-medium text-cream-50">Belum ada RSVP masuk</p>
                <p class="text-sm mt-1">Tamu akan muncul di sini setelah mengirim konfirmasi</p>
            </div>

            <div v-else class="divide-y divide-forest-800">
                <div v-for="item in items" :key="item.slug" class="p-4">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-2">
                                <p class="font-medium text-lg text-cream-50">{{ item.guestName }}</p>
                                <span v-if="item.groupName" class="px-2 py-0.5 text-xs bg-forest-800 border border-forest-700 rounded text-forest-300">{{ item.groupName }}</span>
                            </div>
                            <p class="text-sm text-forest-400 font-mono">{{ item.slug }}</p>
                            <p class="text-xs text-forest-500 mt-1">Maks: {{ item.maxGuests }} orang</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <span :class="['px-3 py-1 rounded-full text-sm font-medium', statusColors[item.status]]">
                                {{ statusLabels[item.status] }}
                            </span>
                        </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3 mt-3 pt-3 border-t border-forest-800">
                        <div>
                            <p class="text-xs text-forest-400">Jumlah Hadir</p>
                            <p class="font-medium text-cream-50">{{ item.attendees }} orang</p>
                        </div>
                        <div>
                            <p class="text-xs text-forest-400">Waktu Respons</p>
                            <p class="font-medium text-cream-50">{{ formatDate(item.respondedAt) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-forest-400">Maks Tamu</p>
                            <p class="font-medium text-cream-50">{{ item.maxGuests }} orang</p>
                        </div>
                    </div>

                    <div v-if="item.message" class="mt-3 p-3 bg-forest-950/50 border border-forest-700/50 rounded-lg">
                        <p class="text-xs text-forest-400 mb-1">Pesan / Ucapan</p>
                        <p class="text-forest-200/90 whitespace-pre-wrap">{{ item.message }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>