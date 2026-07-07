<template>
  <main class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Settings</h1>
          <p class="mt-1 text-sm text-stone-500">Manage your admin profile and account information.</p>
        </div>
        <button class="theme-toggle-btn w-full sm:w-auto sm:px-6" type="button" @click="$emit('toggle-theme')">
          <component :is="themeMode === 'dark' ? Sun : Moon" class="h-4 w-4" />
          {{ themeMode === "dark" ? "Light mode" : "Dark mode" }}
        </button>
      </div>
    </div>

    <div class="px-6 py-8 lg:px-10">
      <form class="card grid gap-6 p-5 lg:grid-cols-[280px_1fr]" @submit.prevent="saveProfile">
        <div class="flex flex-col items-center gap-4 rounded-3xl border border-stone-100 bg-stone-50 p-5 text-center">
          <div class="h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <img v-if="form.profileImageUrl" :src="form.profileImageUrl" alt="" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-3xl font-semibold text-slate-800">{{ initials }}</div>
          </div>
          <div>
            <p class="text-base font-semibold text-stone-950">{{ form.name || "Admin user" }}</p>
            <p class="text-xs uppercase tracking-[0.18em] text-stone-500">{{ form.role }}</p>
          </div>
          <label class="btn-outline w-full cursor-pointer">
            Upload photo
            <input class="hidden" type="file" accept="image/*" @change="uploadProfileImage" />
          </label>
          <button class="btn-outline w-full" type="button" @click="form.profileImageUrl = ''">Remove photo</button>
        </div>

        <div class="grid gap-4">
          <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>
          <div v-if="saved" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">Profile saved.</div>

          <label>
            <span class="label mb-2 block">Name</span>
            <input v-model="form.name" class="field" placeholder="Full name" />
          </label>
          <label>
            <span class="label mb-2 block">Email</span>
            <input v-model="form.email" class="field" type="email" placeholder="email@example.com" />
          </label>
          <label>
            <span class="label mb-2 block">Password</span>
            <input v-model="form.password" class="field" type="password" placeholder="Leave blank to keep current password" />
          </label>
          <label>
            <span class="label mb-2 block">Role</span>
            <select v-model="form.role" class="field">
              <option>ADMIN</option>
              <option>STAFF</option>
            </select>
          </label>

          <button class="btn-gold justify-self-start" type="submit" :disabled="saving">
            {{ saving ? "Saving..." : "Save settings" }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { Moon, Sun } from "@lucide/vue";
import { store } from "../stores/adminStore";

defineEmits(["toggle-theme"]);
defineProps({
  themeMode: { type: String, default: "light" },
});

const currentUser = computed(() => store.currentUser.value);
const form = reactive({ id: "", name: "", email: "", password: "", role: "STAFF", profileImageUrl: "" });
const saving = ref(false);
const saved = ref(false);
const error = ref("");

const initials = computed(() => (form.name || "?").split(" ").map((part) => part[0]).join("").slice(0, 2));

watchEffect(() => {
  if (!currentUser.value) return;
  Object.assign(form, {
    id: currentUser.value.id,
    name: currentUser.value.name,
    email: currentUser.value.email,
    password: "",
    role: currentUser.value.role,
    profileImageUrl: currentUser.value.profileImageUrl || "",
  });
});

const uploadProfileImage = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    form.profileImageUrl = reader.result?.toString() || "";
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

const saveProfile = async () => {
  saving.value = true;
  saved.value = false;
  error.value = "";
  try {
    await store.upsertUser({ ...form });
    saved.value = true;
    form.password = "";
  } catch (err) {
    error.value = err.message || "Unable to save settings.";
  } finally {
    saving.value = false;
  }
};
</script>
