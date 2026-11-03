<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface RundownItem {
    id: number
    time: string
    title: string
    sortOrder: number
}

const items = ref<RundownItem[]>([])
const loading = ref(false)
const saving = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const editModal = ref<{ show: boolean; item: Partial<RundownItem> | null }>({ show: false, item: null })
const formData = reactive({ time: '', title: '', sortOrder: 0 })

async function fetchItems() {
    try {
        const res = await fetch('/api/admin/rundown')
        if (!res.ok) throw new Error('Gagal memuat data')
        items.value = await res.json()
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal memuat susunan acara' }
    }
}

function openAddModal() {
    editModal.value = { show: true, item: null }
    formData.time = ''
    formData.title = ''
    formData.sortOrder = items.value.length
}

function openEditModal(item: RundownItem) {
    editModal.value = { show: true, item }
    formData.time = item.time
    formData.title = item.title
    formData.sortOrder = item.sortOrder
}

async function saveItem() {
    if (!formData.time.trim() || !formData.title.trim()) {
        message.value = { type: 'error', text: 'Waktu dan kegiatan wajib diisi' }
        return
    }

    saving.value = true
    message.value = null

    try {
        const item = editModal.value.item
        const url = item ? `/api/admin/rundown?id=${item.id}` : '/api/admin/rundown'
        const method = item ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                time: formData.time.trim(),
                title: formData.title.trim(),
                sortOrder: formData.sortOrder,
            }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan')

        message.value = { type: 'success', text: item ? 'Item diperbarui' : 'Item ditambahkan' }
        editModal.value.show = false
        await fetchItems()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menyimpan' }
    } finally {
        saving.value = false
    }
}

async function deleteItem(id: number) {
    if (!confirm('Hapus item ini?')) return

    try {
        const res = await fetch(`/api/admin/rundown?id=${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus')

        message.value = { type: 'success', text: 'Item dihapus' }
        await fetchItems()
    } catch (err: any) {
        message.value = { type: 'error', text: err.message ?? 'Gagal menghapus' }
    }
}

async function moveItem(id: number, direction: 'up' | 'down') {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= items.value.length) return

    // Swap sort orders
    const current = items.value[idx]
    const target = items.value[targetIdx]

    try {
        await fetch(`/api/admin/rundown?id=${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time: current.time, title: current.title, sortOrder: target.sortOrder }),
        })
        await fetch(`/api/admin/rundown?id=${target.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time: target.time, title: target.title, sortOrder: current.sortOrder }),
        })
        await fetchItems()
    } catch (err) {
        console.error(err)
        message.value = { type: 'error', text: 'Gagal mengubah urutan' }
    }
}

onMounted(fetchItems)
</script>

<template>
    <div class="space-y-6">
        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="font-serif text-2xl sm:text-3xl text-cream-50">Susunan Acara</h1>
                <p class="text-forest-300/70 mt-1">Kelola jadwal kegiatan perayaan</p>
            </div>
            <button @click="openAddModal" class="btn btn-gold min-h-[44px] whitespace-nowrap">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Item
            </button>
        </header>

        <div v-if="message" :class="['p-4 rounded-lg flex items-center gap-3', message.type === 'success' ? 'bg-green-900/50 border border-green-700/50 text-green-100' : 'bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100']">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="message.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ message.text }}
        </div>

        <!-- List -->
        <div class="card bg-forest-900/50 border-forest-700/50 overflow-hidden">
            <div v-if="items.length === 0" class="p-8 text-center text-forest-300/60">
                <svg class="mx-auto h-12 w-12 text-forest-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p class="font-medium text-cream-50">Belum ada susunan acara</p>
                <p class="text-sm mt-1">Tambah item pertama dengan tombol di atas</p>
            </div>

            <div v-else class="divide-y divide-forest-800">
                <div v-for="item in items" :key="item.id" class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1 text-xs font-mono font-medium bg-forest-950 border border-forest-700 rounded">{{ item.time }}</span>
                            <span class="font-medium text-cream-50 truncate">{{ item.title }}</span>
                        </div>
                        <p class="text-xs text-forest-400 mt-1">Urutan: {{ item.sortOrder }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            @click="moveItem(item.id, 'up')"
                            :disabled="items[0].id === item.id"
                            class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Naikkan"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                        <button
                            @click="moveItem(item.id, 'down')"
                            :disabled="items[items.length - 1].id === item.id"
                            class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Turunkan"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7v-18" />
                            </svg>
                        </button>
                        <button
                            @click="openEditModal(item)"
                            class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 transition"
                            aria-label="Edit"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h4l10-10a2.8 2.8 0 00-4-4L4 16v4z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 6.5 17.5 10.5" />
                            </svg>
                        </button>
                        <button
                            @click="deleteItem(item.id)"
                            class="p-2 rounded-lg text-burgundy-300 hover:bg-burgundy-900/30 hover:text-burgundy-100 transition"
                            aria-label="Hapus"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <Teleport to="body">
            <div v-if="editModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/90 backdrop-blur">
                <div @click.self="editModal.show = false" class="w-full max-w-md bg-forest-900 border border-forest-700 rounded-xl overflow-hidden animate-fade-up">
                    <div class="p-4 border-b border-forest-700 flex items-center justify-between">
                        <h2 class="font-serif text-xl text-cream-50">{{ editModal.item ? 'Edit Item' : 'Tambah Item' }}</h2>
                        <button @click="editModal.show = false" class="p-1 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50" aria-label="Tutup">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form @submit.prevent="saveItem" class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Waktu *</label>
                            <input v-model="formData.time" required type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. 18.00 - 18.30" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Kegiatan *</label>
                            <input v-model="formData.title" required type="text" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" placeholder="Mis. Pembukaan & Sambutan" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-cream-200/90 mb-1">Urutan</label>
                            <input v-model.number="formData.sortOrder" type="number" min="0" class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition" />
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <button type="button" @click="editModal.show = false" class="btn btn-outline-light min-h-[44px]">Batal</button>
                            <button type="submit" :disabled="saving" class="btn btn-gold min-h-[44px]">
                                <span v-if="saving">Menyimpan...</span>
                                <span v-else>{{ editModal.item ? 'Simpan Perubahan' : 'Tambah' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>