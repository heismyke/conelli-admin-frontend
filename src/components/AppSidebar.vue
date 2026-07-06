<template>
  <aside class="sidebar-shell">
    <div class="sidebar-brand">
      <img src="/assets/logo.png" alt="Conelli Engineering" class="h-20 w-full object-contain object-left" />
      <div class="font-body mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Admin Console</div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-link" active-class="nav-link-active">
        <LayoutDashboard class="h-4 w-4" />
        Overview
      </router-link>

      <div class="sidebar-section-label">Operations</div>

      <router-link to="/dashboard/properties" class="nav-link" active-class="nav-link-active">
        <Building2 class="h-4 w-4" />
        Properties
      </router-link>

      <router-link to="/dashboard/investors" class="nav-link" active-class="nav-link-active">
        <Users class="h-4 w-4" />
        Investors
      </router-link>

      <div class="sidebar-section-label">Admin</div>

      <router-link to="/dashboard/users" class="nav-link" active-class="nav-link-active">
        <UserCog class="h-4 w-4" />
        Staff Users
      </router-link>

      <router-link to="/dashboard/messages" class="nav-link" active-class="nav-link-active">
        <MessageSquare class="h-4 w-4" />
        Messages
        <span v-if="realtimeState.unreadMessages" class="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-red-500/30">{{ realtimeState.unreadMessages }}</span>
      </router-link>

      <router-link to="/dashboard/notifications" class="nav-link" active-class="nav-link-active">
        <Bell class="h-4 w-4" />
        Notifications
        <span v-if="realtimeState.unreadNotifications" class="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-red-500/30">{{ realtimeState.unreadNotifications }}</span>
      </router-link>
    </nav>

    <div class="sidebar-account">
      <div class="space-y-3">
        <button class="flex w-full items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50" type="button" @click="$router.push('/dashboard/settings')">
          <div class="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="" class="h-full w-full object-cover" />
            <span v-else class="font-body grid h-full w-full place-items-center text-sm font-semibold text-slate-800">{{ initials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-body truncate text-xs font-medium text-stone-900">{{ user.name }}</div>
            <div class="truncate text-[10px] text-stone-500">{{ user.role }}</div>
          </div>
        </button>
        <button class="btn-gold min-h-10 w-full text-[10px]" type="button" @click="$emit('logout')">
          <LogOut class="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { Bell, Building2, LayoutDashboard, LogOut, MessageSquare, UserCog, Users } from "@lucide/vue";
import { store } from "../stores/adminStore";
import { realtimeState } from "../stores/realtimeStore";

defineEmits(["logout"]);
defineProps({ isLoggedIn: { type: Boolean, required: true } });

const user = computed(() => store.currentUser.value);
const initials = computed(() => user.value.name.split(" ").map((part) => part[0]).join("").slice(0, 2));
</script>
