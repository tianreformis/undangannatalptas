<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
    error.value = ''
    loading.value = true

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password.value }),
            credentials: 'include', // Important for cookies
        })

        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text()
            console.error('Non-JSON response:', text)
            error.value = `Server error (${res.status}): ${text.slice(0, 200)}`
            return
        }

        const data = await res.json()

        if (!res.ok) {
            error.value = data.error ?? `Login gagal (${res.status})`
            return
        }

        const redirect = route.query.redirect as string || '/admin'
        router.push(redirect)
    } catch (err) {
        console.error('Login fetch error:', err)
        error.value = `Kesalahan jaringan: ${err.message}. Cek console (F12) untuk detail.`
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    // Clear password on load
    password.value = ''
})
</script>

<template>
    <div class="min-h-screen bg-forest-950 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <div class="text-center mb-8">
                <svg class="mx-auto h-16 w-16 text-gold-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
                </svg>
                <h1 class="mt-4 font-serif text-3xl text-cream-50">Panel Admin</h1>
                <p class="mt-2 text-forest-200/70">Masuk untuk mengelola undangan Natal Perkantas</p>
            </div>

            <div class="card bg-forest-900/80 border-forest-700/50">
                <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                        <label for="password" class="block text-sm font-medium text-cream-200/90 mb-2">Password</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            @keyup.enter="handleSubmit"
                            class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
                            placeholder="Masukkan password admin"
                            required
                        />
                    </div>

                    <div v-if="error" class="p-3 rounded-lg bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100 text-sm">
                        {{ error }}
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="btn btn-gold w-full min-h-[48px] py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Memproses...
                        </span>
                        <span v-else>Masuk</span>
                    </button>
                </form>

                <p class="mt-6 text-center text-xs text-forest-300/60">
                    Sesi berlaku 12 jam. Cookie HttpOnly, Secure, SameSite=Strict.
                </p>
            </div>
        </div>
    </div>
</template>