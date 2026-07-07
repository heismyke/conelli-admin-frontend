import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "./views/DashboardView.vue";
import InvestorsView from "./views/InvestorsView.vue";
import LoginView from "./views/LoginView.vue";
import MessagesView from "./views/MessagesView.vue";
import NotificationsView from "./views/NotificationsView.vue";
import PropertiesView from "./views/PropertiesView.vue";
import PropertyDetailView from "./views/PropertyDetailView.vue";
import SettingsView from "./views/SettingsView.vue";
import UsersView from "./views/UsersView.vue";

const routes = [
  { path: "/", redirect: () => (localStorage.getItem("conelli_admin_auth") ? "/dashboard" : "/login") },
  { path: "/login", component: LoginView },
  { path: "/dashboard", component: DashboardView },
  { path: "/dashboard/properties", component: PropertiesView },
  { path: "/dashboard/properties/:id", component: PropertyDetailView },
  { path: "/dashboard/investors", component: InvestorsView },
  { path: "/dashboard/users", component: UsersView, meta: { requiresAdmin: true } },
  { path: "/dashboard/settings", component: SettingsView },
  { path: "/dashboard/messages", component: MessagesView },
  { path: "/dashboard/notifications", component: NotificationsView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLogin = to.path === "/login";
  const storedAuth = localStorage.getItem("conelli_admin_auth");
  const isAuthed = Boolean(storedAuth);
  let authUser = null;
  try {
    authUser = JSON.parse(storedAuth || "null");
  } catch {
    authUser = null;
  }

  if (!isLogin && !isAuthed) return { path: "/login", query: { redirect: to.fullPath } };
  if (to.meta.requiresAdmin && String(authUser?.role || "").toUpperCase() !== "ADMIN") return "/dashboard";
  if (isLogin && isAuthed) return "/dashboard";
  return true;
});
