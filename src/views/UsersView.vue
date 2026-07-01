<template>
  <main class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <h1 class="font-display text-3xl font-light text-stone-900">Staff users</h1>
      <p class="mt-1 text-sm text-stone-500">ADMIN-only account management surface.</p>
    </div>

    <div class="grid gap-6 px-6 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
      <form class="card grid gap-4 p-5" @submit.prevent="saveUser">
        <h2 class="font-display text-xl font-light text-stone-900">{{ form.id ? "Edit user" : "Create user" }}</h2>
        <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>
        <div><label class="label mb-2 block">Name</label><input v-model="form.name" class="field" /></div>
        <div><label class="label mb-2 block">Email</label><input v-model="form.email" class="field" type="email" /></div>
        <div><label class="label mb-2 block">Role</label><select v-model="form.role" class="field"><option>ADMIN</option><option>STAFF</option></select></div>
        <button class="btn-gold" type="submit" :disabled="saving">{{ saving ? "Saving..." : "Save user" }}</button>
        <button class="btn-outline" type="button" @click="Object.assign(form, blank)">Clear</button>
      </form>

      <div class="card overflow-hidden">
        <table class="w-full min-w-[620px]">
          <thead class="bg-stone-50">
            <tr class="border-b border-stone-200">
              <th class="label px-5 py-3 text-left">Name</th>
              <th class="label px-5 py-3 text-left">Email</th>
              <th class="label px-5 py-3 text-left">Role</th>
              <th class="label px-5 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in state.users" :key="user.id" class="cursor-pointer border-b border-stone-100 hover:bg-stone-50" @click="Object.assign(form, user)">
              <td class="px-5 py-4 text-sm font-medium text-stone-900">{{ user.name }}</td>
              <td class="px-5 py-4 text-sm text-stone-600">{{ user.email }}</td>
              <td class="px-5 py-4"><span class="badge">{{ user.role }}</span></td>
              <td class="px-5 py-4 text-xs text-stone-500">{{ formatDate(user.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from "vue";
import { state, store } from "../stores/adminStore";

const blank = { id: "", name: "", email: "", role: "STAFF" };
const form = reactive({ ...blank });
const saving = ref(false);
const error = ref("");

const saveUser = async () => {
  saving.value = true;
  error.value = "";
  try {
    await store.upsertUser(form);
    Object.assign(form, blank);
  } catch (err) {
    error.value = err.message || "Unable to save user.";
  } finally {
    saving.value = false;
  }
};

const formatDate = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
</script>
