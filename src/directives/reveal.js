/**
 * v-reveal — animasi muncul saat elemen masuk viewport.
 * Menghormati preferensi `prefers-reduced-motion`.
 * Pemakaian: <section v-reveal> atau <div v-reveal="{ delay: 120 }">
 */
const observers = new WeakMap()

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default {
  mounted(el, binding) {
    if (typeof window === 'undefined') return

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      el.classList.add('reveal-visible')
      return
    }

    const delay = Number(binding.value?.delay ?? 0)
    el.classList.add('reveal')
    if (delay) el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target)
          observers.delete(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    observers.set(el, observer)
  },
  unmounted(el) {
    const observer = observers.get(el)
    if (observer) {
      observer.disconnect()
      observers.delete(el)
    }
  },
}
