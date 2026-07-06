<template>
  <main class="flex h-dvh flex-col overflow-hidden bg-stone-50">
    <div class="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-5 lg:px-10">
      <h1 class="font-display text-3xl font-light text-stone-900">Messages</h1>
      <p class="mt-1 text-sm text-stone-500">Respond to investor questions, document requests, and project support messages in real time.</p>
    </div>

    <div class="min-h-0 flex-1 p-0 lg:p-4">
      <section class="flex h-full min-h-0 flex-col overflow-hidden bg-white shadow-none lg:rounded-[1.5rem] lg:border lg:border-white/90 lg:shadow-[0_18px_50px_rgb(15_23_42_/_0.06)]">
        <div class="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p class="text-sm font-semibold text-stone-900">Investor support room</p>
            <p class="text-xs text-stone-500">Status: {{ realtimeState.status }}</p>
          </div>
        </div>

        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div v-for="message in roomMessages" :key="message.id" class="flex" :class="message.senderRole === 'admin' ? 'justify-end' : 'justify-start'">
            <div class="max-w-2xl rounded-3xl px-4 py-3" :class="message.senderRole === 'admin' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-950'">
              <p class="text-xs font-semibold opacity-70">{{ message.senderName }} · {{ formatTime(message.createdAt) }}</p>
              <p class="mt-1 text-sm leading-relaxed">{{ message.body }}</p>
            </div>
          </div>
          <p v-if="roomMessages.length === 0" class="py-16 text-center text-sm text-stone-500">No messages yet.</p>
        </div>

        <form class="border-t border-stone-100 p-4" @submit.prevent="sendMessage">
          <div class="flex gap-3">
            <input v-model="draft" class="field" placeholder="Message investors..." />
            <button class="btn-gold flex-shrink-0" type="submit">
              <Send class="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Send } from "@lucide/vue";
import { markMessagesRead, realtimeState, roomMessages } from "../stores/realtimeStore";

const draft = ref("");

onMounted(() => {
  markMessagesRead();
});

const sendMessage = () => {
  if (realtimeState.sendMessage?.(draft.value)) draft.value = "";
};

const formatTime = (value) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
</script>
