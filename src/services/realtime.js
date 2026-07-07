const apiBase = import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");
const cleanApiBase = apiBase.replace(/\/$/, "");
const defaultWsUrl = cleanApiBase.startsWith("http")
  ? cleanApiBase.replace(/^http/, "ws") + "/realtime/ws"
  : (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + cleanApiBase + "/realtime/ws";
const wsUrl = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? "" : defaultWsUrl);

export const createRealtimeClient = ({ role, name, id, onEvent, onStatus }) => {
  if (!wsUrl) {
    onStatus?.("disabled");
    return {
      sendMessage() {
        return false;
      },
      close() {},
    };
  }

  let socket;
  let reconnectTimer;

  const connect = () => {
    const url = new URL(wsUrl);
    url.searchParams.set("role", role);
    url.searchParams.set("name", name || role);
    if (id) url.searchParams.set("id", id);
    socket = new WebSocket(url.toString());

    socket.addEventListener("open", () => onStatus?.("connected"));
    socket.addEventListener("close", () => {
      onStatus?.("disconnected");
      reconnectTimer = window.setTimeout(connect, 1500);
    });
    socket.addEventListener("error", () => onStatus?.("disconnected"));
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

  return {
    sendMessage(body) {
      if (!body.trim() || socket?.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify({ type: "message", roomId: "investor-admin", senderId: id, senderName: name, senderRole: role, body }));
      return true;
    },
    close() {
      window.clearTimeout(reconnectTimer);
      socket?.close();
    },
  };
};
