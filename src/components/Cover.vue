<script setup>
import { computed, reactive } from 'vue'
import event from '../config/event'

defineProps({
  name: { type: String, required: true },
  isPersonal: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'edit-name'])

const twinkleStars = [
  { top: '9%', left: '13%', size: 3, delay: '0s' },
  { top: '16%', left: '82%', size: 2, delay: '-1.2s' },
  { top: '27%', left: '7%', size: 2, delay: '-2.4s' },
  { top: '34%', left: '91%', size: 3, delay: '-0.6s' },
  { top: '48%', left: '16%', size: 2, delay: '-1.8s' },
  { top: '55%', left: '86%', size: 2, delay: '-3s' },
  { top: '68%', left: '9%', size: 2, delay: '-2.1s' },
  { top: '73%', left: '78%', size: 2, delay: '-0.9s' },
  { top: '86%', left: '20%', size: 2, delay: '-1.5s' },
  { top: '90%', left: '72%', size: 3, delay: '-2.7s' },
]

const heading = computed(() => event.title || 'Perayaan Natal')

// Jika berkas ornamen belum tersedia, tampilkan fallback SVG sederhana.
const ornaments = reactive({
  top: true,
  bottom: true,
  star: true,
  frame: true,
})

function hideOrnament(key) {
  ornaments[key] = false
}
</script>

<template>
  <section
    class="hide-scrollbar fixed inset-0 z-20 overflow-y-auto overflow-x-hidden overscroll-contain bg-forest-950"
    aria-labelledby="cover-title"
  >
    <!-- Latar berlapis -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(38,88,63,0.9),_transparent_62%)]"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(85,20,29,0.55),_transparent_68%)]"
      aria-hidden="true"
    ></div>
    <div class="pointer-events-none absolute inset-0 paper-grain opacity-25" aria-hidden="true"></div>
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/50 via-transparent to-forest-950"
      aria-hidden="true"
    ></div>

    <!-- Bintang berkelip -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        v-for="(star, index) in twinkleStars"
        :key="index"
        class="absolute rounded-full bg-gold-100 animate-star-twinkle"
        :style="{
          top: star.top,
          left: star.left,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDelay: star.delay,
        }"
      ></span>
    </div>

    <!-- Bingkai emas -->
    <div class="pointer-events-none absolute inset-3 rounded-[1.75rem] border border-gold-300/25" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-[1.15rem] rounded-[1.4rem] border border-gold-200/10" aria-hidden="true"></div>

    <!-- Ornamen: garland atas (kiri + cermin kanan) -->
    <div
      class="pointer-events-none absolute left-0 top-0 w-[46vw] max-w-[340px]"
      aria-hidden="true"
    >
      <picture v-if="ornaments.top">
        <source srcset="/images/garland-top.webp" type="image/webp" />
        <img
          src="/images/garland-top.png"
          alt=""
          width="760"
          height="500"
          loading="eager"
          decoding="async"
          fetchpriority="low"
          class="h-auto w-full origin-top animate-garland-sway"
          @error="hideOrnament('top')"
        />
      </picture>
      <svg v-else class="h-auto w-full text-gold-300/70" viewBox="0 0 200 100" fill="none">
        <path d="M4 10C48 4 108 8 176 34" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55" />
        <path d="M12 24C52 18 96 22 148 40" stroke="currentColor" stroke-width=".7" stroke-linecap="round" opacity=".35" />
        <path d="M22 12l1.8 4.5 4.5 1.8-4.5 1.8L22 24.6l-1.8-4.5-4.5-1.8 4.5-1.8z" fill="currentColor" />
        <path d="M80 14l1.4 3.4 3.4 1.4-3.4 1.4L80 23.6l-1.4-3.4-3.4-1.4 3.4-1.4z" fill="currentColor" opacity=".75" />
        <path d="M140 24l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="currentColor" opacity=".55" />
      </svg>
    </div>
    <div
      class="pointer-events-none absolute right-0 top-0 w-[46vw] max-w-[340px] -scale-x-100"
      aria-hidden="true"
    >
      <picture v-if="ornaments.top">
        <source srcset="/images/garland-top.webp" type="image/webp" />
        <img
          src="/images/garland-top.png"
          alt=""
          width="760"
          height="500"
          loading="eager"
          decoding="async"
          fetchpriority="low"
          class="h-auto w-full origin-top animate-garland-sway"
          style="animation-delay: -3.5s"
          @error="hideOrnament('top')"
        />
      </picture>
      <svg v-else class="h-auto w-full text-gold-300/70" viewBox="0 0 200 100" fill="none">
        <path d="M4 10C48 4 108 8 176 34" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55" />
        <path d="M12 24C52 18 96 22 148 40" stroke="currentColor" stroke-width=".7" stroke-linecap="round" opacity=".35" />
        <path d="M22 12l1.8 4.5 4.5 1.8-4.5 1.8L22 24.6l-1.8-4.5-4.5-1.8 4.5-1.8z" fill="currentColor" />
        <path d="M80 14l1.4 3.4 3.4 1.4-3.4 1.4L80 23.6l-1.4-3.4-3.4-1.4 3.4-1.4z" fill="currentColor" opacity=".75" />
        <path d="M140 24l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="currentColor" opacity=".55" />
      </svg>
    </div>

    <!-- Ornamen: garland bawah, lebar penuh -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
      <picture v-if="ornaments.bottom">
        <source srcset="/images/garland-bottom.webp" type="image/webp" />
        <img
          src="/images/garland-bottom.png"
          alt=""
          width="1600"
          height="326"
          loading="eager"
          decoding="async"
          fetchpriority="low"
          class="block h-auto w-full"
          @error="hideOrnament('bottom')"
        />
      </picture>
      <div v-else class="relative h-9 w-full">
        <svg class="h-full w-full text-gold-300/60" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
          <path d="M0 26C90 8 310 8 400 26" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <svg
          class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-gold-300"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
        </svg>
      </div>
    </div>

    <!-- Isi cover -->
    <div
      class="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-lg flex-col items-center justify-between px-7 pt-8 cover-footer-space"
    >
      <header class="animate-fade-up text-center">
        <div class="mx-auto flex h-24 w-16 items-center justify-center" aria-hidden="true">
          <picture v-if="ornaments.star">
            <source srcset="/images/star.webp" type="image/webp" />
            <img
              src="/images/star.png"
              alt=""
              width="300"
              height="459"
              loading="eager"
              decoding="async"
              class="pointer-events-none h-full w-auto object-contain animate-star-glow"
              @error="hideOrnament('star')"
            />
          </picture>
          <svg v-else class="h-10 w-10 text-gold-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
          </svg>
        </div>
        <p class="mt-1 pl-[0.3em] font-serif text-xl tracking-[0.3em] text-gold-200 sm:text-2xl">PERKANTAS</p>
        <p class="mt-1 text-[10px] uppercase tracking-[0.28em] text-cream-200/60">Perkantas Indonesia</p>
      </header>

      <div class="my-6 w-full text-center">
        <p class="text-[11px] uppercase tracking-widest text-gold-300/80">Undangan</p>
        <h1
          id="cover-title"
          class="mt-3 font-serif text-[2.5rem] leading-[1.12] text-cream-50 text-shadow-dark sm:text-5xl"
        >
          <span class="sr-only">Undangan </span>{{ heading }}
        </h1>
        <p v-if="event.theme" class="mt-3 font-display text-lg italic text-gold-200/90">{{ event.theme }}</p>

        <div class="my-7 flex items-center justify-center gap-3" aria-hidden="true">
          <span class="h-px w-14 bg-gradient-to-r from-transparent to-gold-400/70"></span>
          <svg class="h-3.5 w-3.5 text-gold-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.4l2.5 6.1 6.5.5-5 4.3 1.6 6.4L12 16.4 6.4 19.7 8 13.3l-5-4.3 6.5-.5z" />
          </svg>
          <span class="h-px w-14 bg-gradient-to-l from-transparent to-gold-400/70"></span>
        </div>

        <div class="relative mx-auto w-full max-w-[20rem]">
          <div class="relative aspect-[900/619]">
            <picture v-if="ornaments.frame">
              <source srcset="/images/frame.webp" type="image/webp" />
              <img
                src="/images/frame.png"
                alt=""
                width="900"
                height="619"
                loading="eager"
                decoding="async"
                fetchpriority="low"
                class="pointer-events-none absolute inset-0 h-full w-full object-fill"
                @error="hideOrnament('frame')"
              />
            </picture>
            <div v-else class="pointer-events-none absolute inset-0 rounded-[1.4rem] border border-gold-300/35" aria-hidden="true">
              <div class="absolute inset-2 rounded-[1rem] border border-gold-200/15"></div>
            </div>

            <div class="absolute inset-0 flex flex-col items-center justify-center px-12 pb-9 pt-11 text-center">
              <p class="text-[10px] uppercase tracking-[0.25em] text-cream-200/70">Kepada Yth.</p>
              <p
                class="mt-1 max-w-full break-words font-serif text-xl leading-snug text-gold-100"
                :class="{ 'italic': !isPersonal }"
              >
                {{ name }}
              </p>
              <p class="mt-1 text-[10px] text-cream-200/55">di tempat</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full text-center">
        <button
          type="button"
          class="btn btn-gold group w-full max-w-xs"
          @click="emit('open')"
        >
          <span>Buka Undangan</span>
          <svg
            class="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
        <p
          class="mx-auto mt-3 w-fit max-w-[16rem] rounded-full text-[11px] leading-snug text-cream-100/80 text-shadow-dark sm:border sm:border-cream-100/10 sm:bg-forest-950/55 sm:px-4 sm:py-1.5 sm:backdrop-blur-sm"
        >
          Sentuh tombol untuk membuka undangan.
        </p>
      </div>
    </div>
  </section>
</template>
