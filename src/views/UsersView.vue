<template>
  <main class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Staff users</h1>
          <p class="mt-1 text-sm text-stone-500">ADMIN-only account management surface.</p>
        </div>
        <button class="btn-gold" type="button" @click="startCreate">
          <Plus class="h-4 w-4" />
          New staff user
        </button>
      </div>
    </div>

    <div class="grid gap-6 px-6 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
      <form class="card grid gap-4 p-5" @submit.prevent="saveUser">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="label mb-1">{{ form.id ? "Edit staff user" : "New staff user" }}</p>
            <h2 class="text-xl font-semibold text-stone-950">{{ form.id ? form.name || "Update user" : "Create user" }}</h2>
          </div>
          <button v-if="form.id" class="btn-outline min-h-10 px-4 text-[10px]" type="button" @click="startCreate">
            <Plus class="h-4 w-4" />
            New
          </button>
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>

        <div class="flex items-center gap-4 rounded-3xl border border-stone-100 bg-stone-50 p-4">
          <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <img v-if="form.profileImageUrl" :src="form.profileImageUrl" alt="" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-lg font-semibold text-slate-800">{{ formInitials }}</div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-stone-900">Profile picture</p>
            <p class="text-xs text-stone-500">Upload a square image for best results.</p>
          </div>
          <label class="btn-outline min-h-10 cursor-pointer px-4 text-[10px]">
            Upload
            <input class="hidden" type="file" accept="image/*" @change="uploadProfileImage" />
          </label>
        </div>

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
          <input v-model="form.password" class="field" type="password" :placeholder="form.id ? 'Leave blank to keep current password' : 'Required for new users'" />
        </label>
        <label>
          <span class="label mb-2 block">Role</span>
          <select v-model="form.role" class="field">
            <option>ADMIN</option>
            <option>STAFF</option>
          </select>
        </label>

        <button class="btn-gold" type="submit" :disabled="saving">
          <Save class="h-4 w-4" />
          {{ saving ? "Saving..." : form.id ? "Update user" : "Save user" }}
        </button>
        <button class="btn-outline" type="button" @click="startCreate">
          <X class="h-4 w-4" />
          Clear
        </button>
        <button v-if="form.profileImageUrl" class="btn-outline" type="button" @click="form.profileImageUrl = ''">Remove photo</button>
      </form>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px]">
            <thead class="bg-stone-50">
              <tr class="border-b border-stone-200">
                <th class="label px-5 py-3 text-left">Name</th>
                <th class="label px-5 py-3 text-left">Email</th>
                <th class="label px-5 py-3 text-left">Role</th>
                <th class="label px-5 py-3 text-left">Created</th>
                <th class="label px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in state.users"
                :key="user.id"
                class="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                :class="{ 'bg-stone-50': form.id === user.id }"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="" class="h-full w-full object-cover" />
                      <div v-else class="grid h-full w-full place-items-center text-xs font-semibold text-slate-800">{{ initials(user.name) }}</div>
                    </div>
                    <span class="text-sm font-medium text-stone-900">{{ user.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-stone-600">{{ user.email }}</td>
                <td class="px-5 py-4"><span class="badge">{{ user.role }}</span></td>
                <td class="px-5 py-4 text-xs text-stone-500">{{ formatDate(user.createdAt) }}</td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <button class="icon-btn h-10 w-10" type="button" title="Edit user" @click="selectUser(user)">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      class="icon-btn h-10 w-10 text-red-600 hover:border-red-200 hover:bg-red-50"
                      type="button"
                      title="Delete user"
                      :disabled="deletingId === user.id"
                      @click="deleteUser(user)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="state.users.length === 0" class="px-5 py-12 text-center">
          <p class="text-sm text-stone-500">No staff users have been created yet.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Pencil, Plus, Save, Trash2, X } from "@lucide/vue";
import { state, store } from "../stores/adminStore";

const blankUser = () => ({ id: "", name: "", email: "", password: "", role: "STAFF", profileImageUrl: "" });
const form = reactive(blankUser());
const saving = ref(false);
const deletingId = ref("");
const error = ref("");
const route = useRoute();

const startCreate = () => {
  Object.assign(form, blankUser());
  error.value = "";
};

const initials = (name) => (name || "?").split(" ").map((part) => part[0]).join("").slice(0, 2);
const formInitials = computed(() => initials(form.name));

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

const saveUser = async () => {
  saving.value = true;
  error.value = "";
  try {
    await store.upsertUser({ ...form });
    startCreate();
  } catch (err) {
    error.value = err.message || "Unable to save user.";
  } finally {
    saving.value = false;
  }
};

const selectUser = (user) => {
  Object.assign(form, { id: user.id, name: user.name, email: user.email, password: "", role: user.role, profileImageUrl: user.profileImageUrl || "" });
  error.value = "";
};

const deleteUser = async (user) => {
  const confirmed = window.confirm(`Delete "${user.name}"? Existing updates and documents will keep their content but lose this staff attribution.`);
  if (!confirmed) return;

  deletingId.value = user.id;
  error.value = "";
  try {
    await store.deleteUser(user.id);
    if (form.id === user.id) startCreate();
  } catch (err) {
    error.value = err.message || "Unable to delete user.";
  } finally {
    deletingId.value = "";
  }
};

const formatDate = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

watch(
  () => route.query.mode,
  (mode) => {
    if (mode === "create") startCreate();
  },
  { immediate: true },
);
</script>
