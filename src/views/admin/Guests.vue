<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Guest {
    id: number
    slug: string
    name: string
    groupName: string | null
    maxGuests: number
    createdAt: string
    rsvp: { status: string; attendees: number; message: string; respondedAt: string } | null
}

const router = useRouter()

const guests = ref<Guest[]>([])
const filteredGuests = ref<Guest[]>([])
const loading = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const search = ref('')
const filter = ref<'all' | 'hadir' | 'tidak_hadir' | 'belum'>('all')

const addModal = ref(false)
const bulkModal = ref(false)
const editModal = ref<{ show: boolean; guest: Guest | null }>({ show: false, guest: null })

const formData = reactive({ name: '', groupName: '', maxGuests: 1 })
const bulkText = ref('')

async function fetchGuests() {
    try {
        loading.value = true
        const res = await fetch('/api/admin/guests')
        if (!res.ok) throw new Error('Gagal memuat tamu')
        guests.value = await res.json()
        applyFilters()
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal memuat daftar tamu' }
    } finally {
        loading.value = false
    }
}

function applyFilters() {
    let result = [...guests.value]

    if (search.value) {
        const q = search.value.toLowerCase()
        result = result.filter(g =>
            g.name.toLowerCase().includes(q) ||
            g.groupName?.toLowerCase().includes(q) ||
            g.slug.toLowerCase().includes(q)
        )
    }

    if (filter.value === 'hadir') {
        result = result.filter(g => g.rsvp?.status === 'hadir')
    } else if (filter.value === 'tidak_hadir') {
        result = result.filter(g => g.rsvp?.status === 'tidak_hadir')
    } else if (filter.value === 'belum') {
        result = result.filter(g => !g.rsvp)
    }

    filteredGuests.value = result
}

const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

function getGuestLink(slug: string) {
    return `${siteUrl.replace(/\/$/, '')}/${slug}`
}

function copyLink(slug: string) {
    navigator.clipboard.writeText(getGuestLink(slug))
    message.value = { type: 'success', text: 'Link disalin ke clipboard' }
}

function openWhatsApp(slug: string, name: string, maxGuests: number) {
    const link = getGuestLink(slug)
    const text = `Halo ${name},\n\nDengan sukacita kami mengundang Anda untuk merayakan Natal bersama Perkantas.\n\nBuka undangan digital: ${link}\n\nMaksimal tamu: ${maxGuests} orang\n\nSalam,\nPanitia Perkantas`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
}

function openEditModal(guest: Guest) {
    editModal.value = { show: true, guest }
    formData.name = guest.name
    formData.groupName = guest.groupName ?? ''
    formData.maxGuests = guest.maxGuests
}

async function saveGuest() {
    if (!formData.name.trim()) {
        message.value = { type: 'error', text: 'Nama wajib diisi' }
        return
    }

    try {
        const guest = editModal.value.guest!
        const res = await fetch(`/api/admin/guests?id=${guest.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name.trim(),
                groupName: formData.groupName.trim() || undefined,
                maxGuests: Math.max(1, Math.min(20, Number(formData.maxGuests) || 1)),
            }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan')

        message.value = { type: 'success', text: 'Tamu diperbarui' }
        editModal.value.show = false
        await fetchGuests()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menyimpan' }
    }
}

async function addGuest() {
    if (!formData.name.trim()) {
        message.value = { type: 'error', text: 'Nama wajib diisi' }
        return
    }

    try {
        const res = await fetch('/api/admin/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guests: [{
                    name: formData.name.trim(),
                    groupName: formData.groupName.trim() || undefined,
                    maxGuests: Math.max(1, Math.min(20, Number(formData.maxGuests) || 1)),
                }],
            }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menambah')

        message.value = { type: 'success', text: `${data.count} tamu ditambahkan` }
        addModal.value = false
        formData.name = ''
        formData.groupName = ''
        formData.maxGuests = 1
        await fetchGuests()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menambah tamu' }
    }
}

async function addBulkGuests() {
    if (!bulkText.value.trim()) {
        message.value = { type: 'error', text: 'Daftar nama kosong' }
        return
    }

    try {
        const res = await fetch('/api/admin/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bulkText: bulkText.value }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menambah')

        message.value = { type: 'success', text: `${data.count} tamu ditambahkan` }
        bulkModal.value = false
        bulkText.value = ''
        await fetchGuests()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menambah tamu' }
    }
}

async function deleteGuest(id: number) {
    if (!confirm('Hapus tamu ini? RSVP terkait juga akan terhapus.')) return

    try {
        const res = await fetch(`/api/admin/guests?id=${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus')

        message.value = { type: 'success', text: 'Tamu dihapus' }
        await fetchGuests()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menghapus' }
    }
}

async function exportCsv() {
    try {
        const res = await fetch('/api/admin/guests/export')
        if (!res.ok) throw new Error('Gagal ekspor')

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'daftar-tamu-rsvp.csv'
        a.click()
        URL.revokeObjectURL(url)

        message.value = { type: 'success', text: 'CSV berhasil diunduh' }
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal mengunduh CSV' }
    }
}

const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    tidak_hadir: 'Tidak Hadir',
}
const statusColors: Record<string, string> = {
    hadir: 'bg-green-500/20 text-green-400 border-green-500/30',
    tidak_hadir: 'bg-red-500/20 text-red-400 border-red-500/30',
    null: 'bg-forest-700/50 text-forest-300 border-forest-600/50',
}

onMounted(fetchGuests)
watch([search, filter], applyFilters)
</script>

<template>
    <div class="space-y-6">
        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="font-serif text-2xl sm:text-3xl text-cream-50">Kelola Tamu</h1>
                <p class="text-forest-300/70 mt-1">Daftar tamu undangan & status RSVP</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button @click="addModal = true" class="btn btn-gold min-h-[44px] whitespace-nowrap">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Satu
                </button>
                <button @click="bulkModal = true" class="btn btn-outline-light min-h-[44px] whitespace-nowrap">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Tambah Banyak
                </button>
                <button @click="exportCsv" class="btn btn-outline-light min-h-[44px] whitespace-nowrap">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Ekspor CSV
                </button>
            </div>
        </header>

        <div v-if="message" :class="['p-4 rounded-lg flex items-center gap-3', message.type === 'success' ? 'bg-green-900/50 border border-green-700/50 text-green-100' : 'bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100']">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="message.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ message.text }}
        </div>

        <!-- Search & Filter -->
        <div class="card bg-forest-900/50 border-forest-700/50 p-4 space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1 relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        v-model="search"
                        type="search"
                        placeholder="Cari nama, kelompok, atau slug..."
                        class="w-full min-h-[44px] pl-10 pr-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
                    />
                </div>
                <select
                    v-model="filter"
                    class="min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition whitespace-nowrap"
                >
                    <option value="all">Semua</option>
                    <option value="hadir">Hadir</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                    <option value="belum">Belum Menjawab</option>
                </select>
            </div>
            <p class="text-xs text-forest-400">{{ filteredGuests.length }} dari {{ guests.length }} tamu</p>
        </div>

        <!-- Table -->
        <div class="card bg-forest-900/50 border-forest-700/50 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-forest-900/50">
                        <tr class="text-left text-xs font-medium uppercase tracking-wider text-forest-300/70">
                            <th class="p-3">Nama</th>
                            <th class="p-3 hidden md:table-cell">Kelompok</th>
                            <th class="p-3 hidden lg:table-cell">Maks</th>
                            <th class="p-3">Status RSVP</th>
                            <th class="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-forest-800">
                        <tr v-for="guest in filteredGuests" :key="guest.id" class="hover:bg-forest-900/30 transition">
                            <td class="p-3">
                                <p class="font-medium text-cream-50 truncate max-w-xs">{{ guest.name }}</p>
                                <p class="text-xs text-forest-400 font-mono">{{ guest.slug }}</p>
                            </td>
                            <td class="p-3 hidden md:table-cell text-forest-300/80">{{ guest.groupName ?? '-' }}</td>
                            <td class="p-3 hidden lg:table-cell text-forest-300/80">{{ guest.maxGuests }}</td>
                            <td class="p-3">
                                <span v-if="guest.rsvp" :class="['px-2 py-1 rounded-full text-xs font-medium', statusColors[guest.rsvp.status]]">
                                    {{ statusLabels[guest.rsvp.status] }}
                                </span>
                                <span v-else :class="statusColors.null">Belum Menjawab</span>
                            </td>
                            <td class="p-3 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button
                                        @click="copyLink(guest.slug)"
                                        class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 transition"
                                        aria-label="Salin link"
                                    >
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-1M16 5a2 2 0 012 2v12a2 2 0 01-2 2h-1" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="openWhatsApp(guest.slug, guest.name, guest.maxGuests)"
                                        class="p-2 rounded-lg text-green-400 hover:bg-green-500/20 hover:text-green-300 transition"
                                        aria-label="Kirim WhatsApp"
                                    >
                                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="openEditModal(guest)"
                                        class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 transition"
                                        aria-label="Edit tamu"
                                    >
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h4l10-10a2.8 2.8 0 00-4-4L4 16v4z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 6.5 17.5 10.5" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="deleteGuest(guest.id)"
                                        class="p-2 rounded-lg text-burgundy-300 hover:bg-burgundy-900/30 hover:text-burgundy-100 transition"
                                        aria-label="Hapus tamu"
                                    >
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredGuests.length === 0" class="p-8 text-center text-forest-300/60">
                    <p class="font-medium text-cream-50">Tidak ada tamu yang cocok</p>
                    <p class="text-sm mt-1">Coba ubah pencarian atau filter</p>
                </div>
            </div>
        </div>

        <!-- Add Single Modal -->
        <Teleport to="body">
            <div v-if="addModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/90 backdrop-blur">
                <div @click.self="addModal = false" class="w-full max-w-md bg-forest-900 border border-forest-700 rounded-xl overflow-hidden animate-fade-up">
                    <div class="p-4 border-b border-forest-700 flex items-center justify-between">
                        <h2 class="font-serif text-xl text-cream-50">Tambah Tamu</h2>
                        <button @click="addModal = false" class="p-1 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50" aria-label="Tutup">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form @submit.prevent="addGuest" class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Nama *</label>
                            <input v-model="formData.name" required type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Budi Santoso" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Kelompok (opsional)</label>
                            <input v-model="formData.groupName" type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Keluarga Santoso" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Maks Tamu</label>
                            <input v-model.number="formData.maxGuests" type="number" min="1" max="20" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <button type="button" @click="addModal = false" class="btn btn-outline-light min-h-[44px]">Batal</button>
                            <button type="submit" class="btn btn-gold min-h-[44px]">Tambah</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Bulk Add Modal -->
        <Teleport to="body">
            <div v-if="bulkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/90 backdrop-blur">
                <div @click.self="bulkModal = false" class="w-full max-w-2xl bg-forest-900 border border-forest-700 rounded-xl overflow-hidden animate-fade-up">
                    <div class="p-4 border-b border-forest-700 flex items-center justify-between">
                        <h2 class="font-serif text-xl text-cream-50">Tambah Banyak Tamu</h2>
                        <button @click="bulkModal = false" class="p-1 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50" aria-label="Tutup">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form @submit.prevent="addBulkGuests" class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-2">Satu nama per baris. Format: <code class="text-forest-300/70">Nama | Kelompok | Maks Tamu</code></label>
                            <textarea
                                v-model="bulkText"
                                rows="10"
                                class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-y font-mono text-sm"
                                placeholder="Budi Santoso | Keluarga Santoso | 4&#10;Maria Ulfa | 2&#10;Keluarga Sihombing | 3"
                            ></textarea>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <button type="button" @click="bulkModal = false" class="btn btn-outline-light min-h-[44px]">Batal</button>
                            <button type="submit" class="btn btn-gold min-h-[44px]">Tambah Semua</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Edit Modal -->
        <Teleport to="body">
            <div v-if="editModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/90 backdrop-blur">
                <div @click.self="editModal.show = false" class="w-full max-w-md bg-forest-900 border border-forest-700 rounded-xl overflow-hidden animate-fade-up">
                    <div class="p-4 border-b border-forest-700 flex items-center justify-between">
                        <h2 class="font-serif text-xl text-cream-50">Edit Tamu</h2>
                        <button @click="editModal.show = false" class="p-1 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50" aria-label="Tutup">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form @submit.prevent="saveGuest" class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Nama *</label>
                            <input v-model="formData.name" required type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Kelompok (opsional)</label>
                            <input v-model="formData.groupName" type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Maks Tamu</label>
                            <input v-model.number="formData.maxGuests" type="number" min="1" max="20" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <button type="button" @click="editModal.show = false" class="btn btn-outline-light min-h-[44px]">Batal</button>
                            <button type="submit" class="btn btn-gold min-h-[44px]">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>