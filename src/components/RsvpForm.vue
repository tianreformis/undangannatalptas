<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
    slug: string
    maxGuests: number
    rsvpOpen: boolean
    existingRsvp: { status: string; attendees: number; message: string } | null
}

defineProps<Props>()

interface RsvpForm {
    status: 'hadir' | 'tidak_hadir' | ''
    attendees: number
    message: string
}

const form = ref<RsvpForm>({
    status: '',
    attendees: 1,
    message: '',
})

const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')
const showChange = ref(false)

const isEditing = computed(() => !!props.existingRsvp)

watch(() => props.existingRsvp, (newRsvp) => {
    if (newRsvp) {
        form.value = {
            status: newRsvp.status,
            attendees: newRsvp.status === 'hadir' ? newRsvp.attendees : 0,
            message: newRsvp.message || '',
        }
        showChange.value = false
    }
}, { immediate: true })

function incrementAttendees() {
    if (form.value.attendees < props.maxGuests) form.value.attendees++
}

function decrementAttendees() {
    if (form.value.attendees > 1) form.value.attendees--
}

async function handleSubmit() {
    submitError.value = ''
    submitting.value = true

    try {
        const res = await fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: props.slug,
                status: form.value.status,
                attendees: form.value.attendees,
                message: form.value.message,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error ?? 'Gagal mengirim RSVP')
        }

        submitted.value = true
        form.value = {
            status: data.rsvp.status,
            attendees: data.rsvp.attendees,
            message: data.rsvp.message,
        }
    } catch (err: any) {
        submitError.value = err.message
    } finally {
        submitting.value = false
    }
}

function resetForm() {
    form.value = { status: '', attendees: 1, message: '' }
    submitted.value = false
    showChange.value = false
}
</script>

<template>
    <section v-if="props.rsvpOpen" class="py-12 px-5 sm:px-8" aria-labelledby="rsvp-title">
        <div class="mx-auto w-full max-w-xl">
            <div class="text-center mb-8">
                <h2 id="rsvp-title" class="font-serif text-2xl sm:text-3xl text-cream-50">Konfirmasi Kehadiran</h2>
                <p class="mt-2 text-forest-200/70">Kami menantikan kehadiran Anda. Silakan isi formulir di bawah.</p>
            </div>

            <!-- Already submitted view -->
            <div v-if="submitted && !showChange" class="card bg-forest-900/50 border-forest-700/50 p-6 text-center animate-fade-up">
                <svg v-if="form.status === 'hadir'" class="mx-auto h-16 w-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="mx-auto h-16 w-16 text-burgundy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-4 font-serif text-xl text-cream-50">
                    <span v-if="form.status === 'hadir'">Terima Kasih! Kami Menunggu Kedatangan Anda</span>
                    <span v-else>Terima Kasih Atas Konfirmasinya</span>
                </h3>
                <p class="mt-2 text-forest-200/70">
                    <span v-if="form.status === 'hadir'">Anda akan hadir dengan <strong>{{ form.attendees }} orang</strong>.</span>
                    <span v-else>Kami menghargai kejujuran Anda.</span>
                </p>
                <p v-if="form.message" class="mt-4 p-4 bg-forest-950/50 rounded-lg text-forest-200/90 whitespace-pre-wrap">{{ form.message }}</p>
                <button
                    @click="showChange = true"
                    class="mt-6 btn btn-outline-light min-h-[44px]"
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h4l10-10a2.8 2.8 0 00-4-4L4 16v4z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 6.5 17.5 10.5" />
                    </svg>
                    Ubah Jawaban
                </button>
            </div>

            <!-- Form view -->
            <form v-else @submit.prevent="handleSubmit" class="card bg-forest-900/50 border-forest-700/50 p-6 space-y-6 animate-fade-up">
                <div v-if="submitError" class="p-3 rounded-lg bg-burgundy-900/50 border border-burgundy-700/50 text-burgundy-100 text-sm">
                    {{ submitError }}
                </div>

                <!-- Status Selection -->
                <fieldset>
                    <legend class="block text-sm font-medium text-cream-200/90 mb-3">Apakah Anda akan hadir? *</legend>
                    <div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Status kehadiran">
                        <label class="relative cursor-pointer">
                            <input
                                type="radio"
                                v-model="form.status"
                                value="hadir"
                                name="status"
                                class="sr-only peer"
                                required
                            />
                            <div class="p-4 rounded-xl border-2 text-center transition
                                peer-checked:border-gold-400 peer-checked:bg-gold-500/10
                                border-forest-700 hover:border-gold-500/50">
                                <svg class="mx-auto h-8 w-8 text-green-400 peer-checked:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="mt-2 font-medium text-cream-50 peer-checked:text-gold-300">Ya, Hadir</p>
                            </div>
                        </label>
                        <label class="relative cursor-pointer">
                            <input
                                type="radio"
                                v-model="form.status"
                                value="tidak_hadir"
                                name="status"
                                class="sr-only peer"
                                required
                            />
                            <div class="p-4 rounded-xl border-2 text-center transition
                                peer-checked:border-burgundy-400 peer-checked:bg-burgundy-500/10
                                border-forest-700 hover:border-burgundy-500/50">
                                <svg class="mx-auto h-8 w-8 text-burgundy-400 peer-checked:text-burgundy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="mt-2 font-medium text-cream-50 peer-checked:text-burgundy-300">Tidak Hadir</p>
                            </div>
                        </label>
                    </div>
                </fieldset>

                <!-- Attendees (conditional) -->
                <div v-show="form.status === 'hadir'" class="animate-fade-up">
                    <label class="block text-sm font-medium text-cream-200/90 mb-2">Jumlah Orang *</label>
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            @click="decrementAttendees"
                            :disabled="form.attendees <= 1"
                            class="btn btn-outline-light min-h-[44px] min-w-[44px] p-0 disabled:opacity-30"
                            aria-label="Kurangi"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                        </button>
                        <input
                            v-model.number="form.attendees"
                            type="number"
                            min="1"
                            :max="props.maxGuests"
                            required
                            class="flex-1 text-center text-2xl font-bold text-cream-50 bg-forest-950 border border-forest-700/50 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                        <button
                            type="button"
                            @click="incrementAttendees"
                            :disabled="form.attendees >= props.maxGuests"
                            class="btn btn-outline-light min-h-[44px] min-w-[44px] p-0 disabled:opacity-30"
                            aria-label="Tambah"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    <p class="mt-1 text-xs text-forest-400">Maksimal {{ props.maxGuests }} orang</p>
                </div>

                <!-- Message -->
                <div>
                    <label for="message" class="block text-sm font-medium text-cream-200/90 mb-2">Pesan / Ucapan (opsional)</label>
                    <textarea
                        id="message"
                        v-model="form.message"
                        rows="3"
                        maxlength="300"
                        class="w-full min-h-[44px] px-4 py-3 rounded-lg bg-forest-950 border border-forest-700/50 text-cream-50 placeholder-forest-300/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-y"
                        placeholder="Tulis ucapan atau pesan untuk panitia..."
                    ></textarea>
                    <p class="mt-1 text-xs text-forest-400 text-right">{{ form.message.length }}/300</p>
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    :disabled="submitting"
                    class="btn btn-gold w-full min-h-[48px] py-3"
                >
                    <span v-if="submitting" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Mengirim...
                    </span>
                    <span v-else-if="isEditing">Perbarui Jawaban</span>
                    <span v-else>Kirim Konfirmasi</span>
                </button>

                <p class="text-center text-xs text-forest-400">
                    Data Anda aman dan hanya digunakan untuk keperluan acara.
                </p>
            </form>
        </div>
    </section>
</template>