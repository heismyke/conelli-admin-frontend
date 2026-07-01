<template>
  <main class="flex-1 overflow-auto bg-[#edf3f8]">
    <section class="mx-0 bg-[#111827] px-5 pb-9 pt-4 text-white shadow-2xl shadow-slate-900/10 lg:rounded-[2rem] lg:px-8">
      <div class="mb-10 flex flex-col gap-4 xl:flex-row xl:items-center">
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 overflow-hidden rounded-full border-2 border-white/25 bg-white">
            <img src="/assets/home.png" alt="" class="h-full w-full object-cover" />
          </div>
          <div class="flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white/80">
            <CalendarDays class="h-4 w-4" />
            {{ shortDate }}
          </div>
        </div>

        <div class="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white/70 shadow-inner">
          <Search class="h-5 w-5 flex-shrink-0" />
          <span class="truncate text-sm lg:text-base">Search for properties, investors, documents or updates</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/85">{{ timeLabel }}</div>
          <button class="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/15 text-white hover:bg-white/20" @click="$router.push('/dashboard/properties')">
            <Pencil class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mb-12">
        <h1 class="max-w-4xl text-4xl font-semibold tracking-tight lg:text-5xl">Welcome, {{ firstName }}. Today's a project day.</h1>
        <p class="mt-3 text-lg text-white/55">Your investor-facing data is waiting to be organized.</p>
      </div>

      <div class="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div class="flex items-center gap-3 text-sm text-white/75">
          <Bell class="h-5 w-5" />
          <span>Quick remind: update progress for <button class="underline underline-offset-4" @click="$router.push('/dashboard/properties')">active properties</button></span>
        </div>

        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4 xl:grid-cols-6">
          <button v-for="action in quickActions" :key="action.label" class="group flex flex-col items-center gap-3 text-center text-xs text-white/75" @click="$router.push(action.to)">
            <span class="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/15 shadow-lg shadow-black/10 transition group-hover:bg-white/25">
              <component :is="action.icon" class="h-7 w-7 text-white" />
            </span>
            {{ action.label }}
          </button>
        </div>
      </div>
    </section>

    <div class="-mt-5 px-5 pb-10 lg:px-0">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button v-for="metric in metrics" :key="metric.label" class="card flex items-center justify-between p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl" @click="$router.push(metric.to)">
          <div>
            <div class="mb-7 flex items-center gap-2 text-base font-semibold text-slate-900">
              <component :is="metric.icon" class="h-5 w-5 text-slate-900" />
              {{ metric.label }}
            </div>
            <div class="flex items-end gap-3">
              <p class="text-4xl font-bold text-black">{{ metric.value }}</p>
              <span class="pb-1 text-sm font-semibold text-emerald-500">{{ metric.delta }}</span>
            </div>
          </div>
          <ChevronRight class="h-5 w-5 text-slate-900" />
        </button>
      </div>
    </div>

    <div class="px-5 pb-10 lg:px-0">
      <h2 class="mb-4 text-2xl font-semibold tracking-tight text-slate-950">Recent Activity</h2>
      <div class="grid gap-5 xl:grid-cols-3">
        <section class="card overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div class="flex items-center gap-3 text-lg font-semibold"><Building2 class="h-5 w-5" /> Properties</div>
            <ChevronRight class="h-5 w-5" />
          </div>
          <div class="p-4">
            <div v-for="property in properties.slice(0, 4)" :key="property.id" class="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-slate-50">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-slate-100">
                <Building2 class="h-6 w-6 text-slate-900" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ property.title }}</p>
                <p class="truncate text-xs text-slate-500">{{ property.location }}</p>
              </div>
              <span class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">{{ property.progressPercent }}%</span>
            </div>
          </div>
        </section>

        <section class="card overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div class="flex items-center gap-3 text-lg font-semibold"><Users class="h-5 w-5" /> Investors</div>
            <ChevronRight class="h-5 w-5" />
          </div>
          <div class="p-4">
            <div v-for="investor in state.investors" :key="investor.id" class="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-slate-50">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-slate-900">{{ initials(investor.name) }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ investor.name }}</p>
                <p class="truncate text-xs text-slate-500">{{ investor.email }}</p>
              </div>
              <span class="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600">{{ investor.status }}</span>
            </div>
          </div>
        </section>

        <section class="card overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div class="flex items-center gap-3 text-lg font-semibold"><ClipboardList class="h-5 w-5" /> Updates</div>
            <ChevronRight class="h-5 w-5" />
          </div>
          <div class="p-4">
            <div v-for="update in recentUpdates.slice(0, 4)" :key="update.id" class="flex items-start gap-4 rounded-2xl px-2 py-3 hover:bg-slate-50">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-slate-100">
                <FileText class="h-6 w-6 text-slate-900" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ update.title }}</p>
                <p class="truncate text-xs text-slate-500">{{ propertyTitle(update.propertyId) }}</p>
              </div>
              <span class="text-xs text-slate-400">{{ formatShort(update.postedAt) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from "vue";
import { Bell, Building2, CalendarDays, ChevronRight, ClipboardList, FileText, FolderPlus, Gauge, Pencil, Plus, Search, Upload, UserPlus, Users } from "@lucide/vue";
import { state, store } from "../stores/adminStore";

const properties = computed(() => state.properties);
const activeProjects = computed(() => properties.value.filter((item) => item.progressPercent < 100).length);
const avgProgress = computed(() => Math.round(properties.value.reduce((sum, item) => sum + item.progressPercent, 0) / properties.value.length));
const recentUpdates = computed(() => [...state.updates].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 10));
const firstName = computed(() => store.currentUser.value.name.split(" ")[0]);

const shortDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const timeLabel = new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

const quickActions = [
  { label: "Add Property", to: "/dashboard/properties", icon: FolderPlus },
  { label: "Add Investor", to: "/dashboard/investors", icon: UserPlus },
  { label: "Log Update", to: "/dashboard/properties", icon: ClipboardList },
  { label: "Upload File", to: "/dashboard/properties", icon: Upload },
  { label: "Manage Staff", to: "/dashboard/users", icon: Users },
  { label: "Set Progress", to: "/dashboard/properties", icon: Gauge },
];

const metrics = computed(() => [
  { label: "Properties", value: properties.value.length, delta: "+3 / seeded", to: "/dashboard/properties", icon: Building2 },
  { label: "Active projects", value: activeProjects.value, delta: "+2 / active", to: "/dashboard/properties", icon: Gauge },
  { label: "Avg. completion", value: `${avgProgress.value}%`, delta: "+3 / new", to: "/dashboard/properties", icon: ClipboardList },
  { label: "Investors", value: state.investors.length, delta: "+2 / linked", to: "/dashboard/investors", icon: Plus },
]);

const propertyTitle = (id) => state.properties.find((item) => item.id === id)?.title || "Unknown";
const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2);
const formatShort = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
</script>
