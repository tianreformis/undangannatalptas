<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Settings {
    title: string
    theme: string
    greeting: string
    verse_text: string
    verse_reference: string
    event_date: string
    event_time: string
    time_zone_label: string
    venue_name: string
    address: string
    maps_url: string
    dress_code: string
    contact_name: string
    contact_whatsapp: string
    rsvp_open: '1' | '0'
}

const settings = reactive<Settings>({
    title: 'Perayaan Natal',
    theme: '',
    greeting: 'Dengan sukacita kami mengundang Bapak/Ibu/Saudara/i untuk merayakan Natal bersama.',
    verse_text: '',
    verse_reference: '',
    event_date: '',
    event_time: '',
    time_zone_label: 'WIB',
    venue_name: '',
    address: '',
    maps_url: '',
    dress_code: '',
    contact_name: '',
    contact_whatsapp: '',
    rsvp_open: '0',
})

const loading = ref(false)
const saving = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

async function fetchSettings() {
    try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) throw new Error('Gagal memuat pengaturan')
        const data = await res.json()
        Object.assign(settings, data)
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal memuat pengaturan' }
    }
}

async function saveSettings() {
    saving.value = true
    message.value = null

    try {
        const res = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan')

        message.value = { type: 'success', text: 'Pengaturan berhasil disimpan' }
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menyimpan pengaturan' }
    } finally {
        saving.value = false
    }
}

function openPreview() {
    const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    window.open(baseUrl, '_blank')
}

onMounted(fetchSettings)
</script>

<template>
    <div class="space-y-6">
        <header>
            <h1 class="font-serif text-2xl sm:text-3xl text-cream-50">Pengaturan Acara</h1>
            <p class="text-forest-300/70 mt-1">Kelola detail acara perayaan Natal</p>
        </header>

        <div v-if="message" :class="['p-4 rounded-lg flex items-center gap-3', message.type === 'success' ? 'bg-green-900/50 border border-green-700/50 text-green-100' : 'bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100']">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="message.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ message.text }}
        </div>

        <form @submit.prevent="saveSettings" class="space-y-6">
            <!-- Basic Info -->
            <fieldset class="card bg-forest-900/50 border-forest-700/50 p-5 space-y-5">
                <legend class="font-serif text-lg text-gold-300 mb-2">Informasi Dasar</legend>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Judul Acara *</label>
                        <input v-model="settings.title" required class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Perayaan Natal" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Tema</label>
                        <input v-model="settings.theme" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Natal Keluarga / Natal Meriah" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-cream-200/90 mb-1">Salam Pembuka / Ucapan</label>
                    <textarea v-model="settings.greeting" rows="3" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-y" placeholder="Ucapan selamat datang untuk tamu..."></textarea>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Ayat (teks)</label>
                        <textarea v-model="settings.verse_text" rows="2" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-y" placeholder="Teks ayat..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Referensi Ayat</label>
                        <input v-model="settings.verse_reference" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Yesaya 9:5" />
                    </div>
                </div>
            </fieldset>

            <!-- Date & Time -->
            <fieldset class="card bg-forest-900/50 border-forest-700/50 p-5 space-y-5">
                <legend class="font-serif text-lg text-gold-300 mb-2">Tanggal & Waktu</legend>

                <div class="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Tanggal *</label>
                        <input v-model="settings.event_date" type="date" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Waktu *</label>
                        <input v-model="settings.event_time" type="time" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Zona Waktu</label>
                        <input v-model="settings.time_zone_label" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="WIB" />
                    </div>
                </div>
            </fieldset>

            <!-- Venue -->
            <fieldset class="card bg-forest-900/50 border-forest-700/50 p-5 space-y-5">
                <legend class="font-serif text-lg text-gold-300 mb-2">Tempat</legend>

                <div>
                    <label class="block text-sm font-medium text-cream-200/90 mb-1">Nama Tempat</label>
                    <input v-model="settings.venue_name" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Gereja Perkantas Pusat" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-cream-200/90 mb-1">Alamat Lengkap</label>
                    <textarea v-model="settings.address" rows="2" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-y" placeholder="Jl. Contoh No. 123, Jakarta"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-cream-200/90 mb-1">Link Google Maps (HTTPS)</label>
                    <input v-model="settings.maps_url" type="url" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="https://maps.google.com/..." />
                </div>
            </fieldset>

            <!-- Dress Code & Contact -->
            <fieldset class="card bg-forest-900/50 border-forest-700/50 p-5 space-y-5">
                <legend class="font-serif text-lg text-gold-300 mb-2">Dress Code & Kontak</legend>

                <div>
                    <label class="block text-sm font-medium text-cream-200/90 mb-1">Dress Code</label>
                    <input v-model="settings.dress_code" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Batik / Formal / Merah-Hijau" />
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">Nama Kontak</label>
                        <input v-model="settings.contact_name" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Pdt. Andreas" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-cream-200/90 mb-1">WhatsApp (format 62xxxxxxxxx)</label>
                        <input v-model="settings.contact_whatsapp" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="628123456789" />
                    </div>
                </div>
            </fieldset>

            <!-- RSVP Toggle -->
            <fieldset class="card bg-forest-900/50 border-forest-700/50 p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-medium text-cream-50">Buka RSVP</p>
                        <p class="text-sm text-forest-300/70">Izinkan tamu mengonfirmasi kehadiran via undangan</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                            v-model="settings.rsvp_open"
                            type="checkbox"
                            true-value="1"
                            false-value="0"
                            class="sr-only peer"
                        />
                        <div class="w-11 h-6 bg-forest-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-forest-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                </div>
            </fieldset>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
                <button type="button" @click="openPreview" class="btn btn-outline-light min-h-[44px]">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Undangan
                </button>
                <button type="submit" :disabled="saving" class="btn btn-gold min-h-[44px]">
                    <span v-if="saving" class="flex items-center gap-2">
                        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyimpan...
                    </span>
                    <span v-else>Simpan Pengaturan</span>
                </button>
            </div>
        </form>
    </div>
</template>