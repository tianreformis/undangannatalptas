<script setup lang="ts">
import AdminLayout from '@/components/admin/AdminLayout.vue'
import Summary from '@/views/admin/Summary.vue'
import Settings from '@/views/admin/Settings.vue'
import Rundown from '@/views/admin/Rundown.vue'
import Guests from '@/views/admin/Guests.vue'
import Rsvps from '@/views/admin/Rsvps.vue'
</script>

<template>
    <AdminLayout>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </AdminLayout>
</template>