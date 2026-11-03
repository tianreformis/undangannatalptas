<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const navItems = [
    { name: 'admin-summary', label: 'Ringkasan', icon: SummaryIcon },
    { name: 'admin-settings', label: 'Pengaturan Acara', icon: SettingsIcon },
    { name: 'admin-rundown', label: 'Susunan Acara', icon: RundownIcon },
    { name: 'admin-guests', label: 'Tamu', icon: GuestsIcon },
    { name: 'admin-rsvps', label: 'Daftar RSVP', icon: RsvpsIcon },
]

async function handleLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
        router.push('/admin/login')
    }
}

function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
    sidebarOpen.value = false
}

watch(() => route.path, () => {
    closeSidebar()
})
</script>

<template>
    <div class="admin-layout min-h-screen bg-forest-950">
        <!-- Mobile sidebar overlay -->
        <div
            v-if="sidebarOpen"
            class="fixed inset-0 bg-forest-950/80 z-40 lg:hidden"
            @click="closeSidebar"
            aria-hidden="true"
        ></div>

        <!-- Sidebar -->
        <aside
            :class="['fixed lg:static inset-y-0 left-0 z-50 w-64 bg-forest-900 border-r border-forest-800 transform transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full']"
            aria-label="Navigasi admin"
        >
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="p-4 border-b border-forest-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <svg class="h-8 w-8 text-gold-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
                        </svg>
                        <span class="font-serif text-xl text-cream-50">Admin</span>
                    </div>
                    <button
                        v-if="sidebarOpen"
                        @click="closeSidebar"
                        class="lg:hidden p-2 rounded-lg text-forest-300 hover:bg-forest-800"
                        aria-label="Tutup menu"
                    >
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menu utama">
                    <template v-for="item in navItems" :key="item.name">
                        <router-link
                            :to="{ name: item.name }"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200/90 hover:bg-forest-800 hover:text-cream-50 transition"
                            :class="{ 'bg-gold-500/10 text-gold-300': route.name === item.name }"
                        >
                            <component :is="item.icon" class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span>{{ item.label }}</span>
                        </router-link>
                    </template>
                </nav>

                <!-- Footer / User -->
                <div class="p-3 border-t border-forest-800">
                    <div class="flex items-center gap-3 px-3 py-2">
                        <div class="h-8 w-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                            <svg class="h-5 w-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-cream-50 truncate">Administrator</p>
                            <p class="text-xs text-forest-300/60 truncate">Perkantas</p>
                        </div>
                        <button
                            @click="handleLogout"
                            class="p-2 rounded-lg text-forest-300 hover:bg-forest-800 hover:text-cream-50 transition"
                            aria-label="Keluar"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="lg:pl-64">
            <!-- Top bar (mobile only) -->
            <header class="lg:hidden sticky top-0 z-30 bg-forest-900/95 backdrop-blur border-b border-forest-800">
                <div class="flex items-center justify-between h-14 px-4">
                    <button @click="toggleSidebar" class="p-2 rounded-lg text-forest-200 hover:bg-forest-800" aria-label="Buka menu">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span class="font-serif text-lg text-cream-50">Panel Admin</span>
                    <div class="w-10"></div>
                </div>
            </header>

            <main class="p-4 lg:p-6" id="main-content">
                <slot />
            </main>
        </div>
    </div>
</template>