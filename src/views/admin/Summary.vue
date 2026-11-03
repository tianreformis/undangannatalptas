<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
    totalInvited: 0,
    totalGuests: 0,
    attending: 0,
    notAttending: 0,
    pending: 0,
    totalAttending: 0,
})

const loading = ref(true)
const error = ref('')

async function fetchStats() {
    try {
        const res = await fetch('/api/admin/guests')
        if (!res.ok) throw new Error('Gagal memuat data')

        const guests = await res.json()

        stats.value.totalInvited = guests.length
        stats.value.totalGuests = guests.reduce((sum: number, g: any) => sum + (g.maxGuests || 1), 0)

        for (const g of guests) {
            if (g.rsvp) {
                if (g.rsvp.status === 'hadir') {
                    stats.value.attending++
                    stats.value.totalAttending += g.rsvp.attendees || 0
                } else if (g.rsvp.status === 'tidak_hadir') {
                    stats.value.notAttending++
                }
            } else {
                stats.value.pending++
            }
        }
    } catch (err) {
        error.value = 'Gagal memuat statistik'
        console.error(err)
    } finally {
        loading.value = false
    }
}

function goToGuests(filter?: string) {
    router.push({ name: 'admin-guests', query: filter ? { filter } : {} })
}

onMounted(fetchStats)
</script>

<template>
    <div class="space-y-6">
        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="font-serif text-2xl sm:text-3xl text-cream-50">Ringkasan</h1>
                <p class="text-forest-300/70 mt-1">Ikhtisar statistik undangan dan RSVP</p>
            </div>
            <button
                @click="goToGuests"
                class="btn btn-gold min-h-[44px] whitespace-nowrap"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Kelola Tamu
            </button>
        </header>

        <div v-if="error" class="p-4 rounded-lg bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100">
            {{ error }}
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                label="Total Diundang"
                :value="stats.totalInvited"
                icon="users"
                color="gold"
                @click="goToGuests"
            />
            <StatCard
                label="Total Tamu (maks)"
                :value="stats.totalGuests"
                icon="user-plus"
                color="green"
                @click="goToGuests"
            />
            <StatCard
                label="Hadir"
                :value="stats.attending"
                icon="check-circle"
                color="green"
                :subValue="`${stats.totalAttending} orang`"
                @click="() => goToGuests('hadir')"
            />
            <StatCard
                label="Tidak Hadir"
                :value="stats.notAttending"
                icon="x-circle"
                color="red"
                @click="() => goToGuests('tidak_hadir')"
            />
            <StatCard
                label="Belum Menjawab"
                :value="stats.pending"
                icon="clock"
                color="orange"
                @click="() => goToGuests('belum')"
            />
            <StatCard
                label="Total Orang Hadir"
                :value="stats.totalAttending"
                icon="users"
                color="blue"
                @click="goToGuests"
            />
        </div>

        <!-- Quick Actions -->
        <div class="card bg-forest-900/50 border-forest-700/50">
            <h2 class="font-serif text-xl text-cream-50 mb-4">Aksi Cepat</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <router-link to="/admin/settings" class="action-btn">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Pengaturan Acara</span>
                </router-link>
                <router-link to="/admin/rundown" class="action-btn">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Susunan Acara</span>
                </router-link>
                <router-link to="/admin/guests" class="action-btn">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Kelola Tamu</span>
                </router-link>
                <router-link to="/admin/rsvps" class="action-btn">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Daftar RSVP</span>
                </router-link>
            </div>
        </div>
    </div>
</template>