<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "./components/AppSidebar.vue";
import { loadAdminData } from "./stores/adminStore";

const route = useRoute();
const router = useRouter();
const authKey = "conelli_admin_auth";
const isLoggedIn = ref(Boolean(localStorage.getItem(authKey)));
const isLoginRoute = computed(() => route.path === "/login");

const handleLogin = (credentials) => {
  localStorage.setItem(authKey, JSON.stringify({ email: credentials.email, role: credentials.role }));
  isLoggedIn.value = true;
  router.replace(route.query.redirect?.toString() || "/dashboard");
};

const handleLogout = () => {
  localStorage.removeItem(authKey);
  isLoggedIn.value = false;
  router.replace("/login");
};

onMounted(() => {
  if (isLoggedIn.value) loadAdminData();
});
</script>

<template>
  <div class="app-shell min-h-screen text-stone-950" :class="{ 'lg:flex': !isLoginRoute }">
    <AppSidebar v-if="!isLoginRoute" :is-logged-in="isLoggedIn" @logout="handleLogout" />

    <div class="content-shell min-w-0 flex-1">
      <router-view @login="handleLogin" />

      <footer v-if="!isLoginRoute" class="border-t border-stone-200 px-5 py-8 lg:px-10">
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
