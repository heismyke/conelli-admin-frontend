<template>
  <main class="flex h-dvh flex-col overflow-hidden bg-stone-50">
    <div class="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-5 lg:px-10">
      <h1 class="font-display text-3xl font-light text-stone-900">Notifications</h1>
      <p class="mt-1 text-sm text-stone-500">Realtime activity from investor messages and admin support.</p>
    </div>

    <div class="min-h-0 flex-1 p-0 lg:p-4">
      <section class="h-full min-h-0 overflow-y-auto bg-white shadow-none lg:rounded-[1.5rem] lg:border lg:border-white/90 lg:shadow-[0_18px_50px_rgb(15_23_42_/_0.06)]">
        <div v-for="notification in realtimeState.notifications" :key="notification.id" class="border-b border-stone-100 px-5 py-4 last:border-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-stone-950">{{ notification.title }}</p>
              <p class="mt-1 text-sm text-stone-600">{{ notification.body }}</p>
            </div>
            <span class="flex-shrink-0 text-xs text-stone-400">{{ formatTime(notification.createdAt) }}</span>
          </div>
        </div>
        <p v-if="realtimeState.notifications.length === 0" class="grid h-full min-h-[480px] place-items-center px-5 text-center text-sm text-stone-500">No notifications yet.</p>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from "vue";
import { markNotificationsRead, realtimeState } from "../stores/realtimeStore";

onMounted(markNotificationsRead);

const formatTime = (value) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
</script>
