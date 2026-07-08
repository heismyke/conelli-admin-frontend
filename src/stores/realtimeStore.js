import { computed, reactive } from "vue";

export const investorRoomPrefix = (investorId) => `investor-${investorId || "guest"}-`;
export const investorRoomId = (investorId) => `${investorRoomPrefix(investorId)}admin`;
export const staffInvestorRoomId = (investorId, staffId) => `${investorRoomPrefix(investorId)}staff-${staffId || "support"}`;

export const realtimeState = reactive({
  messages: [],
  notifications: [],
  status: "disconnected",
  identity: { id: "", role: "" },
  unreadNotifications: 0,
  unreadMessages: 0,
  sendMessage: null,
});

export const roomMessages = computed(() => realtimeState.messages.filter((item) => item.roomId === "investor-admin"));

const isOwnEvent = (event) => {
  const senderId = String(event.senderId || "");
  return Boolean(senderId && senderId === String(realtimeState.identity.id || ""));
};

export const applyRealtimeEvent = (event) => {
  if (event.type === "snapshot") {
    realtimeState.messages = event.messages || [];
    realtimeState.notifications = event.notifications || [];
    realtimeState.unreadNotifications = realtimeState.notifications.filter((item) => !item.read && !isOwnEvent(item)).length;
    realtimeState.unreadMessages = realtimeState.messages.filter((item) => !isOwnEvent(item)).length;
    return;
  }
  if (event.type === "message") {
    if (!realtimeState.messages.some((item) => item.id === event.id)) {
      realtimeState.messages.push(event);
      if (!isOwnEvent(event)) realtimeState.unreadMessages += 1;
    }
  }
  if (event.type === "notification") {
    if (!realtimeState.notifications.some((item) => item.id === event.id)) {
      realtimeState.notifications.unshift(event);
      if (!isOwnEvent(event)) realtimeState.unreadNotifications += 1;
    }
  }
};

export const setRealtimeIdentity = ({ id, role } = {}) => {
  realtimeState.identity = { id: id || "", role: role || "" };
};

export const markMessagesRead = () => {
  realtimeState.unreadMessages = 0;
};

export const markNotificationsRead = () => {
  realtimeState.unreadNotifications = 0;
  realtimeState.notifications = realtimeState.notifications.map((item) => ({ ...item, read: true }));
};
