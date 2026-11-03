import { createRouter, createWebHistory } from 'vue-router'
import Invitation from '../views/Invitation.vue'

const routes = [
    {
        path: '/admin/login',
        name: 'admin-login',
        component: () => import('../views/admin/Login.vue'),
        meta: { layout: 'admin', noAuth: true },
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { layout: 'admin', requiresAuth: true },
        children: [
            { path: '', name: 'admin-summary', component: () => import('../views/admin/Summary.vue') },
            { path: 'settings', name: 'admin-settings', component: () => import('../views/admin/Settings.vue') },
            { path: 'rundown', name: 'admin-rundown', component: () => import('../views/admin/Rundown.vue') },
            { path: 'guests', name: 'admin-guests', component: () => import('../views/admin/Guests.vue') },
            { path: 'rsvps', name: 'admin-rsvps', component: () => import('../views/admin/Rsvps.vue') },
        ],
    },
    {
        path: '/',
        name: 'invitation-home',
        component: Invitation,
    },
    {
        path: '/:slug',
        name: 'invitation',
        component: Invitation,
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }

        // Perubahan query (mis. saat nama penerima diedit) tidak boleh menggulir halaman.
        if (to.path === from.path) return false

        return { top: 0 }
    },
})

// Navigation guard for admin routes
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
    const noAuth = to.matched.some(r => r.meta.noAuth)

    if (requiresAuth) {
        // Check for admin session cookie (client-side check)
        // The actual validation happens on API calls, but we can redirect early
        const hasSessionCookie = document.cookie.split('; ').some(c => c.startsWith('admin_session='))
        if (!hasSessionCookie) {
            return next({ name: 'admin-login', query: { redirect: to.fullPath } })
        }
    }

    if (noAuth && to.name === 'admin-login') {
        // If already logged in, redirect to dashboard
        const hasSessionCookie = document.cookie.split('; ').some(c => c.startsWith('admin_session='))
        if (hasSessionCookie) {
            return next({ name: 'admin-dashboard' })
        }
    }

    next()
})

export default router