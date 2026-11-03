<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <a
    href="#undangan"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest-900 focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:text-cream-50"
  >
    Lewati ke isi undangan
  </a>
  <RouterView />
</template>
