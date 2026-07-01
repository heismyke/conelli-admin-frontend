<template>
  <div class="flex min-h-screen bg-stone-950">
    <div class="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2">
      <div class="absolute inset-0 bg-stone-950"></div>
      <div class="absolute inset-0 opacity-45" style="background-image: url('/assets/home.png'); background-size: cover; background-position: center;"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20"></div>
      <div class="relative z-10 flex flex-col gap-3">
        <img src="/assets/logo.png" alt="Conelli Engineering" class="brand-logo-light h-24 w-72 object-contain object-left" />
        <div class="font-body text-[10px] uppercase tracking-[0.28em] text-white/70">Admin Console</div>
      </div>
      <div class="relative z-10">
        <p class="font-body mb-6 text-[10px] uppercase tracking-[0.3em] text-white/60">Internal operations</p>
        <h2 class="font-display mb-6 text-5xl font-light leading-tight text-white">
          Project data.<br />
          Investor access.<br />
          Kept current.
        </h2>
        <p class="font-body max-w-sm text-sm leading-relaxed text-white/70">
          Maintain properties, updates, milestones, materials, and documents for the investor portal.
        </p>
      </div>
      <div></div>
    </div>

    <div class="flex flex-1 items-center justify-center bg-stone-50 p-8">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h1 class="font-display mb-2 text-4xl font-light text-stone-900">Staff login</h1>
          <p class="font-body text-sm text-stone-500">Use your Conelli staff account to manage investor-facing data.</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="label mb-2 block">Email address</label>
            <input v-model="email" type="email" class="field" placeholder="admin@conelliengineering.com" required />
          </div>
          <div>
            <label class="label mb-2 block">Password</label>
            <input v-model="password" type="password" class="field" placeholder="Any password in dev" required />
          </div>
          <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>
          <button type="submit" class="btn-gold w-full" :disabled="loading">{{ loading ? "Signing in..." : "Sign in" }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { loadAdminData, loginStaff } from "../stores/adminStore";

const emit = defineEmits(["login"]);
const email = ref("admin@conelliengineering.com");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = "Enter a valid staff email and password.";
    return;
  }
  loading.value = true;
  try {
    const payload = await loginStaff({ email: email.value, password: password.value });
    await loadAdminData();
    error.value = "";
    emit("login", payload.user);
  } catch (err) {
    error.value = err.message || "Unable to sign in.";
  } finally {
    loading.value = false;
  }
};
</script>
