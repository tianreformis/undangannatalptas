<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)
let context = null
let animationId = 0
let flakes = []
let width = 0
let height = 0
let dpr = 1
let time = 0
let mediaQuery = null

const MAX_FLAKES = 60

function createFlakes() {
  const count = Math.min(MAX_FLAKES, Math.max(18, Math.round(width / 14)))
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.7 + Math.random() * 1.9,
    speed: 0.16 + Math.random() * 0.55,
    drift: -0.16 + Math.random() * 0.32,
    alpha: 0.22 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  }))
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas || !context) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight

  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(dpr, 0, 0, dpr, 0, 0)

  createFlakes()
}

function draw() {
  if (!context) return
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#ffffff'

  for (const flake of flakes) {
    context.globalAlpha = flake.alpha
    context.beginPath()
    context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
}

function tick() {
  animationId = window.requestAnimationFrame(tick)
  if (document.hidden) return

  time += 0.012
  for (const flake of flakes) {
    flake.y += flake.speed
    flake.x += flake.drift + Math.sin(time + flake.phase) * 0.18

    if (flake.y - flake.radius > height) {
      flake.y = -flake.radius * 2
      flake.x = Math.random() * width
    }
    if (flake.x < -flake.radius * 2) flake.x = width + flake.radius
    if (flake.x > width + flake.radius * 2) flake.x = -flake.radius
  }

  draw()
}

function start() {
  if (typeof window === 'undefined' || !canvasRef.value) return
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (mediaQuery.matches) return

  context = canvasRef.value.getContext('2d', { alpha: true })
  if (!context) return

  resize()
  draw()
  animationId = window.requestAnimationFrame(tick)

  window.addEventListener('resize', resize, { passive: true })
}

function stop() {
  window.cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
}

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <canvas ref="canvasRef" class="snow-canvas" aria-hidden="true"></canvas>
</template>
