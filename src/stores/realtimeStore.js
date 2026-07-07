import { computed, reactive } from "vue";

export const investorRoomPrefix = (investorId) => `investor-${investorId || "guest"}-`;
export const investorRoomId = (investorId) => `${investorRoomPrefix(investorId)}admin`;
export const staffInvestorRoomId = (investorId, staffId) => `${investorRoomPrefix(investorId)}staff-${staffId || "support"}`;

export const realtimeState = reactive({
  messages: [],
  notifications: [],
  status: "disconnected",
  unreadNotifications: 0,
  unreadMessages: 0,
  sendMessage: null,
});

export const roomMessages = computed(() => realtimeState.messages.filter((item) => item.roomId === "investor-admin"));

export const applyRealtimeEvent = (event) => {
  if (event.type === "snapshot") {
    realtimeState.messages = event.messages || [];
    realtimeState.notifications = event.notifications || [];
    realtimeState.unreadNotifications = realtimeState.notifications.filter((item) => !item.read).length;
    realtimeState.unreadMessages = realtimeState.messages.length;
    return;
  }
  if (event.type === "message") {
    realtimeState.messages.push(event);
    realtimeState.unreadMessages += 1;
  }
  if (event.type === "notification") {
    realtimeState.notifications.unshift(event);
    realtimeState.unreadNotifications += 1;
  }
};

export const markMessagesRead = () => {
  realtimeState.unreadMessages = 0;
};

export const markNotificationsRead = () => {
  realtimeState.unreadNotifications = 0;
  realtimeState.notifications = realtimeState.notifications.map((item) => ({ ...item, read: true }));
};
