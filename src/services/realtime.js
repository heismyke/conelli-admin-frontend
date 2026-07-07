const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000");
const cleanApiBase = apiBase.replace(/\/$/, "");
const defaultWsUrl = cleanApiBase.startsWith("http")
  ? cleanApiBase.replace(/^http/, "ws") + "/realtime/ws"
  : (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + cleanApiBase + "/realtime/ws";
const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

const request = async (path, options = {}) => {
  const response = await fetch(`${cleanApiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Realtime request failed: ${response.status}`);
  return response.json();
};

export const createRealtimeClient = ({ role, name, id, onEvent, onStatus }) => {
  let socket;
  let reconnectTimer;
  let pollTimer;
  let closed = false;

  const applySnapshot = (payload) => onEvent?.({ type: "snapshot", messages: payload.messages || [], notifications: payload.notifications || [] });

  const poll = async () => {
    if (closed) return;
    try {
      const payload = await request("/realtime/messages");
      applySnapshot(payload);
      if (socket?.readyState !== WebSocket.OPEN) onStatus?.("polling");
    } catch {
      if (socket?.readyState !== WebSocket.OPEN) onStatus?.("disconnected");
    } finally {
      if (!closed) pollTimer = window.setTimeout(poll, 3000);
    }
  };

  const connect = () => {
    try {
      const url = new URL(wsUrl);
      url.searchParams.set("role", role);
      url.searchParams.set("name", name || role);
      if (id) url.searchParams.set("id", id);
      socket = new WebSocket(url.toString());
    } catch {
      onStatus?.("polling");
      return;
    }

    socket.addEventListener("open", () => onStatus?.("connected"));
    socket.addEventListener("close", () => {
      if (closed) return;
      onStatus?.("polling");
      reconnectTimer = window.setTimeout(connect, 3000);
    });
    socket.addEventListener("error", () => onStatus?.("polling"));
    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "snapshot") {
        onEvent?.({ type: "snapshot", ...JSON.parse(payload.body || "{}") });
        return;
      }
      onEvent?.(payload);
    });
  };

  connect();
  poll();

  return {
    sendMessage(body, roomId = "investor-admin") {
      const message = body.trim();
      if (!message) return false;
      const payload = { type: "message", roomId, senderId: id, senderName: name, senderRole: role, body: message };
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
        return true;
      }
      onEvent?.({
        type: "message",
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        roomId,
        senderId: id,
        senderName: name,
        senderRole: role,
        body: message,
        createdAt: new Date().toISOString(),
      });
      request("/realtime/messages", { method: "POST", body: JSON.stringify(payload) })
        .then((response) => {
          if (response.message) onEvent?.(response.message);
          if (response.notification) onEvent?.(response.notification);
        })
        .catch(() => onStatus?.("disconnected"));
      onStatus?.("polling");
      return true;
    },
    close() {
      closed = true;
      window.clearTimeout(reconnectTimer);
      window.clearTimeout(pollTimer);
      socket?.close();
    },
  };
};
