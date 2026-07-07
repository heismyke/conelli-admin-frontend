<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "./components/AppSidebar.vue";
import { loadAdminData, store } from "./stores/adminStore";
import { createRealtimeClient } from "./services/realtime";
import { applyRealtimeEvent, realtimeState } from "./stores/realtimeStore";

const route = useRoute();
const router = useRouter();
const authKey = "conelli_admin_auth";
const themeKey = "conelli_admin_theme";
const isLoggedIn = ref(Boolean(localStorage.getItem(authKey)));
const themeMode = ref(localStorage.getItem(themeKey) || "light");
const isLoginRoute = computed(() => route.path === "/login");
const hideFooter = computed(() => route.path === "/dashboard/messages" || route.path === "/dashboard/notifications");
const isDarkTheme = computed(() => themeMode.value === "dark");
let realtimeClient;

const handleLogin = (credentials) => {
  localStorage.setItem(authKey, JSON.stringify({ email: credentials.email, role: credentials.role }));
  isLoggedIn.value = true;
  router.replace(route.query.redirect?.toString() || "/dashboard");
};

const handleLogout = () => {
  localStorage.removeItem(authKey);
  isLoggedIn.value = false;
  realtimeClient?.close();
  realtimeClient = null;
  realtimeState.sendMessage = null;
  router.replace("/login");
};

const toggleTheme = () => {
  themeMode.value = isDarkTheme.value ? "light" : "dark";
  localStorage.setItem(themeKey, themeMode.value);
};

const startRealtime = () => {
  if (realtimeClient || !isLoggedIn.value) return;
  const user = store.currentUser.value;
  realtimeClient = createRealtimeClient({
    role: "admin",
    id: user.id,
    name: user.name,
    onEvent: applyRealtimeEvent,
    onStatus: (status) => {
      realtimeState.status = status;
    },
  });
  realtimeState.sendMessage = realtimeClient.sendMessage;
};

onMounted(() => {
  if (isLoggedIn.value) loadAdminData().finally(startRealtime);
});

watch(isLoggedIn, (value) => {
  if (value) startRealtime();
});

onBeforeUnmount(() => realtimeClient?.close());
</script>

<template>
  <div class="app-shell min-h-screen text-stone-950" :class="[{ 'lg:flex': !isLoginRoute }, isDarkTheme ? 'theme-dark' : 'theme-light']">
    <AppSidebar v-if="!isLoginRoute" :is-logged-in="isLoggedIn" :theme-mode="themeMode" @logout="handleLogout" @toggle-theme="toggleTheme" />

    <div class="content-shell flex min-w-0 flex-1 flex-col">
      <div class="route-shell flex min-h-0 flex-1 flex-col">
        <router-view @login="handleLogin" />
      </div>

      <footer v-if="!isLoginRoute && !hideFooter" class="border-t border-stone-200 px-5 py-8 lg:px-10">
        <div class="mx-auto flex max-w-7xl flex-col gap-4 text-xs font-light text-stone-500 md:flex-row md:items-center md:justify-between">
          <p class="tracking-wide">© 2026 Conelli Engineering Limited. Admin Console.</p>
          <div class="flex flex-wrap gap-6">
            <a href="/dashboard/properties">Properties</a>
            <a href="/dashboard/investors">Investors</a>
            <a href="mailto:conelliengineeringlimited@gmail.com">Support</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
