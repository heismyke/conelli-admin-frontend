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
    </nav>

    <div class="sidebar-account">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
            <span class="font-body text-sm font-semibold text-slate-800">{{ initials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-body truncate text-xs font-medium text-stone-900">{{ user.name }}</div>
            <div class="truncate text-[10px] text-stone-500">{{ user.role }}</div>
          </div>
        </div>
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
import { Building2, LayoutDashboard, LogOut, UserCog, Users } from "@lucide/vue";
import { store } from "../stores/adminStore";

defineEmits(["logout"]);
defineProps({ isLoggedIn: { type: Boolean, required: true } });

const user = computed(() => store.currentUser.value);
const initials = computed(() => user.value.name.split(" ").map((part) => part[0]).join("").slice(0, 2));
</script>
