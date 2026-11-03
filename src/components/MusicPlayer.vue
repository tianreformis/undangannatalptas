<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
    visible: { type: Boolean, default: false },
    musicUrl: { type: String, default: '' },
})

const audioRef = ref<HTMLAudioElement | null>(null)
const available = ref(false)
const playing = ref(false)

watch(
    () => props.musicUrl,
    (url) => {
        available.value = Boolean(url)
        if (audioRef.value && url) {
            audioRef.value.src = url
        }
    },
    { immediate: true },
)

async function play() {
    const audio = audioRef.value
    if (!audio || !available.value) return false

    try {
        audio.volume = 0.4
        await audio.play()
        playing.value = true
        return true
    } catch {
        playing.value = false
        return false
    }
}

function pause() {
    const audio = audioRef.value
    if (!audio) return
    audio.pause()
    playing.value = false
}

function toggle() {
    if (playing.value) pause()
    else play()
}

function handleError() {
    available.value = false
    playing.value = false
}

function handleVisibility() {
    if (document.hidden && playing.value) pause()
}

watch(
    () => props.visible,
    (isVisible) => {
        if (!isVisible) pause()
    },
)

onMounted(() => {
    if (audioRef.value) audioRef.value.volume = 0.4
    document.addEventListener('visibilitychange', handleVisibility)
})

onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    pause()
})

defineExpose({ play, pause, toggle })
</script>

<template>
    <div>
        <audio
            ref="audioRef"
            :src="props.musicUrl"
            loop
            preload="none"
            playsinline
            @play="playing = true"
            @pause="playing = false"
            @error="handleError"
        ></audio>

        <div v-if="props.visible && available" class="fixed bottom-5 right-4 z-50 safe-bottom">
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-full border border-gold-300/50 bg-forest-900/90 text-gold-200 shadow-soft backdrop-blur transition hover:border-gold-300 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          :aria-label="playing ? 'Matikan musik latar' : 'Nyalakan musik latar'"
          :aria-pressed="playing"
          :title="playing ? 'Matikan musik' : 'Nyalakan musik'"
          @click="toggle"
        >
          <svg
            v-if="playing"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.5v13l10-6.5z" />
          </svg>
        </button>

        <span class="sr-only" aria-live="polite">{{ playing ? 'Musik latar dinyalakan' : 'Musik latar dimatikan' }}</span>
        </div>
    </div>
</template>