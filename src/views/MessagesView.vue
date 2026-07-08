<template>
  <main class="flex h-dvh flex-col overflow-hidden bg-stone-50">
    <div class="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-5 lg:px-10">
      <h1 class="font-display text-3xl font-light text-stone-900">Messages</h1>
      <p class="mt-1 text-sm text-stone-500">Select an investor conversation and respond in real time.</p>
    </div>

    <div class="min-h-0 flex-1 p-0 lg:p-4">
      <section class="grid h-full min-h-0 overflow-hidden bg-white shadow-none lg:grid-cols-[360px_1fr] lg:rounded-[1.5rem] lg:border lg:border-white/90 lg:shadow-[0_18px_50px_rgb(15_23_42_/_0.06)]">
        <aside class="min-h-0 border-stone-100 lg:border-r" :class="selectedInvestor ? 'hidden lg:flex' : 'flex'">
          <div class="flex min-h-0 w-full flex-col">
            <div class="border-b border-stone-100 px-5 py-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-stone-900">Chats</p>
                  <p class="text-xs text-stone-500">Status: {{ realtimeState.status }}</p>
                </div>
                <span class="rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">{{ conversations.length }}</span>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto">
              <button
                v-for="conversation in conversations"
                :key="conversation.investor.id"
                class="flex w-full items-center gap-3 border-b border-stone-100 px-5 py-4 text-left transition hover:bg-stone-50"
                :class="selectedInvestor?.id === conversation.investor.id ? 'bg-stone-50' : ''"
                type="button"
                @click="selectConversation(conversation.investor.id)"
              >
                <span class="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">{{ initials(conversation.investor.name) }}</span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-3">
                    <span class="truncate text-sm font-semibold text-stone-900">{{ conversation.investor.name }}</span>
                    <span class="text-[10px] text-stone-400">{{ conversation.lastMessage ? formatShortTime(conversation.lastMessage.createdAt) : "" }}</span>
                  </span>
                  <span class="mt-1 block truncate text-xs text-stone-500">{{ conversation.preview }}</span>
                </span>
                <span v-if="conversation.inboundCount" class="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{{ conversation.inboundCount }}</span>
              </button>

              <p v-if="conversations.length === 0" class="px-5 py-12 text-center text-sm text-stone-500">No investors available yet.</p>
            </div>
          </div>
        </aside>

        <div class="min-h-0" :class="selectedInvestor ? 'flex' : 'hidden lg:flex'">
          <section v-if="selectedInvestor" class="flex min-h-0 w-full flex-col">
            <div class="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-4">
              <div class="flex min-w-0 items-center gap-3">
                <button class="icon-btn h-10 w-10 lg:hidden" type="button" title="Back to chats" @click="selectedInvestorId = ''">
                  <ArrowLeft class="h-4 w-4" />
                </button>
                <span class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">{{ initials(selectedInvestor.name) }}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-stone-900">{{ selectedInvestor.name }}</p>
                  <p class="truncate text-xs text-stone-500">{{ selectedInvestor.email }}</p>
                </div>
              </div>
              <p class="hidden text-xs text-stone-500 sm:block">{{ roomMessages.length }} messages</p>
            </div>

            <div ref="messagesScroller" class="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <div v-for="message in roomMessages" :key="message.id" class="flex" :class="message.senderRole === 'admin' ? 'justify-end' : 'justify-start'">
                <div class="max-w-2xl rounded-3xl px-4 py-3" :class="message.senderRole === 'admin' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-950'">
                  <p class="text-xs font-semibold opacity-70">{{ message.senderName }} · {{ formatTime(message.createdAt) }}</p>
                  <p class="mt-1 text-sm leading-relaxed">{{ message.body }}</p>
                </div>
              </div>
              <p v-if="roomMessages.length === 0" class="py-16 text-center text-sm text-stone-500">No messages with {{ selectedInvestor.name }} yet.</p>
            </div>

            <form class="border-t border-stone-100 p-4" @submit.prevent="sendMessage">
              <div class="flex gap-3">
                <input v-model="draft" class="field" :placeholder="`Message ${selectedInvestor.name}...`" />
                <button class="btn-gold flex-shrink-0" type="submit">
                  <Send class="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </section>

          <div v-else class="grid h-full w-full place-items-center px-6 text-center">
            <div>
              <MessageCircle class="mx-auto mb-4 h-10 w-10 text-stone-300" />
              <p class="text-sm font-semibold text-stone-900">Select a chat</p>
              <p class="mt-1 text-sm text-stone-500">Choose an investor from the list to open the chat room.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { ArrowLeft, MessageCircle, Send } from "@lucide/vue";
import { state, store } from "../stores/adminStore";
import { investorRoomPrefix, markMessagesRead, realtimeState, staffInvestorRoomId } from "../stores/realtimeStore";

const draft = ref("");
const selectedInvestorId = ref("");
const messagesScroller = ref(null);

const sortedMessages = computed(() => [...realtimeState.messages].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))));

const conversations = computed(() => state.investors.map((investor) => {
  const roomPrefix = investorRoomPrefix(investor.id);
  const roomId = investorRoomId(investor.id);
  const messages = sortedMessages.value.filter((message) => message.roomId === roomId || String(message.roomId || "").startsWith(roomPrefix));
  const lastMessage = messages.at(-1);
  return {
    investor,
    roomId,
    lastMessage,
    inboundCount: messages.filter((message) => message.senderRole === "investor").length,
    preview: lastMessage?.body || "No messages yet",
  };
}).sort((a, b) => {
  if (!a.lastMessage && !b.lastMessage) return a.investor.name.localeCompare(b.investor.name);
  if (!a.lastMessage) return 1;
  if (!b.lastMessage) return -1;
  return String(b.lastMessage.createdAt).localeCompare(String(a.lastMessage.createdAt));
}));

const selectedInvestor = computed(() => state.investors.find((investor) => investor.id === selectedInvestorId.value) || null);
const currentUser = computed(() => store.currentUser.value);
const selectedRoomPrefix = computed(() => selectedInvestor.value ? investorRoomPrefix(selectedInvestor.value.id) : "");
const roomMessages = computed(() => sortedMessages.value.filter((message) => selectedRoomPrefix.value && String(message.roomId || "").startsWith(selectedRoomPrefix.value)));
const selectedRoomId = computed(() => selectedInvestor.value ? staffInvestorRoomId(selectedInvestor.value.id, currentUser.value?.id || "admin") : "");

const scrollMessagesToBottom = async () => {
  await nextTick();
  if (messagesScroller.value) messagesScroller.value.scrollTop = messagesScroller.value.scrollHeight;
};

watch(() => [selectedInvestorId.value, roomMessages.value.length], scrollMessagesToBottom);

const selectConversation = (investorId) => {
  selectedInvestorId.value = investorId;
  markMessagesRead();
  scrollMessagesToBottom();
};

onMounted(() => {
  markMessagesRead();
  scrollMessagesToBottom();
});

const sendMessage = () => {
  if (!selectedRoomId.value) return;
  if (realtimeState.sendMessage?.(draft.value, selectedRoomId.value)) draft.value = "";
};

const initials = (name) => String(name || "")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const formatTime = (value) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const formatShortTime = (value) => new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
</script>
