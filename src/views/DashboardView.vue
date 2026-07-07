<template>
  <main class="flex-1 overflow-auto bg-[#edf3f8]">
    <section class="mx-0 bg-[#111827] px-5 pb-9 pt-4 text-white shadow-2xl shadow-slate-900/10 lg:rounded-[2rem] lg:px-8">
      <div class="mb-10 flex flex-col gap-4 xl:flex-row xl:items-center">
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 overflow-hidden rounded-full border-2 border-white/25 bg-white">
            <img src="/assets/home.png" alt="" class="h-full w-full object-cover" />
          </div>
          <div class="relative">
            <button class="flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/15" type="button" @click="showTimelinePicker = !showTimelinePicker">
              <CalendarDays class="h-4 w-4" />
              {{ shortDate }}
            </button>
            <div v-if="showTimelinePicker" class="absolute left-0 top-14 z-30 w-80 rounded-[1.75rem] border border-white/10 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-950/30">
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Timeline</p>
                  <p class="text-base font-semibold">{{ timelineTitle }}</p>
                </div>
                <button class="grid h-9 w-9 place-items-center rounded-full border border-slate-200 hover:bg-slate-50" type="button" @click="showTimelinePicker = false">
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="mb-3 grid grid-cols-3 gap-2">
                <button v-for="preset in timelinePresets" :key="preset.label" class="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950" type="button" @click="preset.apply">
                  {{ preset.label }}
                </button>
              </div>

              <div class="mb-3 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1">
                <button class="rounded-full px-3 py-2 text-xs font-semibold transition" :class="timelineMode === 'day' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" type="button" @click="timelineMode = 'day'">Day</button>
                <button class="rounded-full px-3 py-2 text-xs font-semibold transition" :class="timelineMode === 'week' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" type="button" @click="timelineMode = 'week'">Last 7 days</button>
              </div>

              <div class="flex items-center gap-2">
                <button class="grid h-11 w-11 place-items-center rounded-full border border-slate-200 hover:bg-slate-50" type="button" @click="shiftTimeline(-1)">
                  <ChevronLeft class="h-4 w-4" />
                </button>
                <input v-model="selectedDate" class="h-11 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900" type="date" />
                <button class="grid h-11 w-11 place-items-center rounded-full border border-slate-200 hover:bg-slate-50" type="button" @click="shiftTimeline(1)">
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form class="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white/70 shadow-inner" @submit.prevent="runSearch">
          <Search class="h-5 w-5 flex-shrink-0" />
          <input
            v-model="searchTerm"
            class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none lg:text-base"
            placeholder="Search for properties, investors, documents or updates"
            type="search"
          />
        </form>

        <div class="flex items-center gap-3">
          <div class="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/85">{{ timeLabel }}</div>
          <button class="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/15 text-white hover:bg-white/20" @click="$router.push({ path: '/dashboard/properties', query: { mode: 'create' } })">
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
          <span>Quick remind: update progress for <button class="underline underline-offset-4" @click="$router.push(firstPropertyPath('progress'))">active properties</button></span>
        </div>

        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4 xl:grid-cols-6">
          <button v-for="action in quickActions" :key="action.label" class="group flex flex-col items-center gap-3 text-center text-xs text-white/75" @click="$router.push(action.to())">
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
        <button v-for="metric in metrics" :key="metric.label" class="card flex items-center justify-between p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl" @click="$router.push(metric.to())">
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
      <div class="mb-4">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-slate-950">Activity Timeline</h2>
          <p class="text-sm text-slate-500">{{ timelineTitle }}</p>
        </div>
      </div>
      <div class="grid gap-5 xl:grid-cols-3">
        <section class="card overflow-hidden">
          <button class="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left" @click="$router.push('/dashboard/properties')">
            <div class="flex items-center gap-3 text-lg font-semibold"><Building2 class="h-5 w-5" /> Properties</div>
            <ChevronRight class="h-5 w-5" />
          </button>
          <div class="p-4">
            <button v-for="property in properties.slice(0, 4)" :key="property.id" class="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left hover:bg-slate-50" @click="$router.push(`/dashboard/properties/${property.id}`)">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-slate-100">
                <Building2 class="h-6 w-6 text-slate-900" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ property.title }}</p>
                <p class="truncate text-xs text-slate-500">{{ property.location }}</p>
              </div>
              <span class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">{{ property.progressPercent }}%</span>
            </button>
          </div>
        </section>

        <section class="card overflow-hidden">
          <button class="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left" @click="$router.push('/dashboard/investors')">
            <div class="flex items-center gap-3 text-lg font-semibold"><Users class="h-5 w-5" /> Investors</div>
            <ChevronRight class="h-5 w-5" />
          </button>
          <div class="p-4">
            <button v-for="investor in state.investors" :key="investor.id" class="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left hover:bg-slate-50" @click="$router.push({ path: '/dashboard/investors', query: { investor: investor.id } })">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-slate-900">{{ initials(investor.name) }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ investor.name }}</p>
                <p class="truncate text-xs text-slate-500">{{ investor.email }}</p>
              </div>
              <span class="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600">{{ investor.status }}</span>
            </button>
          </div>
        </section>

        <section class="card overflow-hidden">
          <button class="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left" @click="$router.push(firstPropertyPath('updates'))">
            <div class="flex items-center gap-3 text-lg font-semibold"><ClipboardList class="h-5 w-5" /> Updates</div>
            <ChevronRight class="h-5 w-5" />
          </button>
          <div class="p-4">
            <button v-for="update in timelineUpdates.slice(0, 4)" :key="update.id" class="flex w-full items-start gap-4 rounded-2xl px-2 py-3 text-left hover:bg-slate-50" @click="$router.push(updatePropertyPath(update.propertyId, 'updates'))">
              <div class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-slate-100">
                <FileText class="h-6 w-6 text-slate-900" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-950">{{ update.title }}</p>
                <p class="truncate text-xs text-slate-500">{{ propertyTitle(update.propertyId) }}</p>
              </div>
              <span class="text-xs text-slate-400">{{ formatShort(update.postedAt) }}</span>
            </button>
            <div v-if="!timelineUpdates.length" class="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No updates recorded for this timeline.
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell, Building2, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, FileText, FolderPlus, Gauge, Pencil, Plus, Search, Upload, UserPlus, Users, X } from "@lucide/vue";
import { state, store } from "../stores/adminStore";

const router = useRouter();
const properties = computed(() => state.properties);
const activeProjects = computed(() => properties.value.filter((item) => item.progressPercent < 100).length);
const avgProgress = computed(() => Math.round(properties.value.reduce((sum, item) => sum + item.progressPercent, 0) / properties.value.length));
const recentUpdates = computed(() => [...state.updates].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 10));
const firstName = computed(() => store.currentUser.value.name.split(" ")[0]);
const searchTerm = ref("");
const showTimelinePicker = ref(false);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const timelineMode = ref("day");

const parseSelectedDate = () => {
  const [year, month, day] = selectedDate.value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateInputValue = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const shortDate = computed(() => parseSelectedDate().toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
const timelineRange = computed(() => {
  const end = parseSelectedDate();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  if (timelineMode.value === "week") start.setDate(start.getDate() - 6);
  return { start, end };
});
const timelineTitle = computed(() => {
  const { start, end } = timelineRange.value;
  const longDate = (date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (timelineMode.value === "day") return `Showing activity for ${longDate(end)}`;
  return `Showing activity from ${longDate(start)} to ${longDate(end)}`;
});
const timelineUpdates = computed(() => recentUpdates.value.filter((update) => {
  const postedAt = new Date(update.postedAt);
  return postedAt >= timelineRange.value.start && postedAt <= timelineRange.value.end;
}));
const timeLabel = new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

const timelinePresets = [
  { label: "Today", apply: () => setTimelineDate(new Date(), "day") },
  { label: "Yesterday", apply: () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    setTimelineDate(date, "day");
  } },
  { label: "Last week", apply: () => setTimelineDate(new Date(), "week") },
];

const setTimelineDate = (date, mode = timelineMode.value) => {
  selectedDate.value = toDateInputValue(date);
  timelineMode.value = mode;
};

const shiftTimeline = (direction) => {
  const date = parseSelectedDate();
  date.setDate(date.getDate() + direction * (timelineMode.value === "week" ? 7 : 1));
  selectedDate.value = toDateInputValue(date);
};

const firstPropertyPath = (focus) => {
  const first = properties.value[0];
  return first ? { path: `/dashboard/properties/${first.id}`, query: { focus } } : { path: "/dashboard/properties", query: { mode: "create" } };
};

const updatePropertyPath = (propertyId, focus) => {
  return propertyId ? { path: `/dashboard/properties/${propertyId}`, query: { focus } } : firstPropertyPath(focus);
};

const runSearch = () => {
  const term = searchTerm.value.trim();
  if (!term) return;
  const lower = term.toLowerCase();
  const property = state.properties.find((item) => [item.title, item.location, item.category, item.status].some((value) => String(value || "").toLowerCase().includes(lower)));
  if (property) {
    router.push(`/dashboard/properties/${property.id}`);
    return;
  }
  const investor = state.investors.find((item) => [item.name, item.email, item.status].some((value) => String(value || "").toLowerCase().includes(lower)));
  if (investor) {
    router.push({ path: "/dashboard/investors", query: { investor: investor.id } });
    return;
  }
  const update = state.updates.find((item) => [item.title, item.body].some((value) => String(value || "").toLowerCase().includes(lower)));
  if (update) {
    router.push(updatePropertyPath(update.propertyId, "updates"));
    return;
  }
  const document = state.documents.find((item) => [item.title, item.fileUrl].some((value) => String(value || "").toLowerCase().includes(lower)));
  if (document?.propertyId) {
    router.push(updatePropertyPath(document.propertyId, "documents"));
    return;
  }
  if (document?.investorId) router.push({ path: "/dashboard/investors", query: { investor: document.investorId } });
};

const quickActions = [
  { label: "Add Property", to: () => ({ path: "/dashboard/properties", query: { mode: "create" } }), icon: FolderPlus },
  { label: "Add Investor", to: () => ({ path: "/dashboard/investors", query: { mode: "create" } }), icon: UserPlus },
  { label: "Log Update", to: () => firstPropertyPath("updates"), icon: ClipboardList },
  { label: "Upload File", to: () => firstPropertyPath("documents"), icon: Upload },
  { label: "Manage Staff", to: () => ({ path: "/dashboard/users", query: { mode: "create" } }), icon: Users },
  { label: "Set Progress", to: () => firstPropertyPath("progress"), icon: Gauge },
];

const metrics = computed(() => [
  { label: "Properties", value: properties.value.length, delta: "+3 / seeded", to: () => "/dashboard/properties", icon: Building2 },
  { label: "Active projects", value: activeProjects.value, delta: "+2 / active", to: () => firstPropertyPath("progress"), icon: Gauge },
  { label: "Avg. completion", value: `${avgProgress.value}%`, delta: "+3 / new", to: () => firstPropertyPath("progress"), icon: ClipboardList },
  { label: "Investors", value: state.investors.length, delta: "+2 / linked", to: () => "/dashboard/investors", icon: Plus },
]);

const propertyTitle = (id) => state.properties.find((item) => item.id === id)?.title || "Unknown";
const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2);
const formatShort = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
</script>
