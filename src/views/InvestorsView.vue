<template>
  <main class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Investors</h1>
          <p class="mt-1 text-sm text-stone-500">Manage investor details, property visibility, and investor documents.</p>
        </div>
        <button class="btn-gold" @click="newInvestor">New investor</button>
      </div>
    </div>

    <div class="grid gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-stone-50">
            <tr class="border-b border-stone-200">
              <th class="label px-5 py-3 text-left">Name</th>
              <th class="label px-5 py-3 text-left">Properties</th>
              <th class="label px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="investor in state.investors" :key="investor.id" class="cursor-pointer border-b border-stone-100 hover:bg-stone-50" @click="selectInvestor(investor)">
              <td class="px-5 py-4">
                <p class="text-sm font-medium text-stone-900">{{ investor.name }}</p>
                <p class="text-xs text-stone-500">{{ investor.email }}</p>
              </td>
              <td class="px-5 py-4 text-sm text-stone-600">{{ assignmentCount(investor.id) }}</td>
              <td class="px-5 py-4"><span class="badge">{{ investor.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">{{ form.id ? "Edit investor" : "Create investor" }}</h2>
        <form class="mb-6 grid gap-4 lg:grid-cols-2" @submit.prevent="saveInvestor">
          <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 lg:col-span-2">{{ error }}</div>
          <div><label class="label mb-2 block">Name</label><input v-model="form.name" class="field" /></div>
          <div><label class="label mb-2 block">Email</label><input v-model="form.email" class="field" type="email" /></div>
          <div><label class="label mb-2 block">Phone</label><input v-model="form.phone" class="field" /></div>
          <div><label class="label mb-2 block">Member since</label><input v-model="form.memberSince" class="field" type="date" /></div>
          <div><label class="label mb-2 block">Status</label><select v-model="form.status" class="field"><option>active</option><option>inactive</option></select></div>
          <button class="btn-gold self-end" type="submit" :disabled="saving">{{ saving ? "Saving..." : "Save investor" }}</button>
        </form>

        <div v-if="form.id" class="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 class="label mb-3">Property access</h3>
            <div class="space-y-2">
              <label v-for="property in state.properties" :key="property.id" class="flex items-start gap-3 border border-stone-100 px-3 py-2">
                <input class="mt-1" type="checkbox" :checked="isAssigned(property.id)" @change="toggleProperty(property.id, $event.target.checked)" />
                <span>
                  <span class="block text-sm font-medium text-stone-800">{{ property.title }}</span>
                  <span class="text-xs text-stone-500">{{ property.location }}</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <h3 class="label mb-3">Investor documents</h3>
            <form class="mb-3 grid gap-3" @submit.prevent="addInvestorDocument">
              <input v-model="docForm.title" class="field" placeholder="Document title" />
              <input v-model="docForm.fileUrl" class="field" placeholder="File URL" />
              <button class="btn-outline" type="submit">Upload document</button>
            </form>
            <div class="space-y-2">
              <div v-for="doc in investorDocuments" :key="doc.id" class="flex items-center justify-between border border-stone-100 px-3 py-2">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-stone-800">{{ doc.title }}</p>
                  <p class="truncate text-xs text-stone-500">{{ doc.fileUrl }}</p>
                </div>
                <button class="text-xs text-red-600" @click="deleteDocument(doc.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { state, store } from "../stores/adminStore";

const form = reactive({ id: "", name: "", email: "", phone: "", memberSince: "", status: "active" });
const docForm = reactive({ propertyId: null, investorId: "", title: "", fileUrl: "" });
const saving = ref(false);
const error = ref("");

const selectInvestor = (investor) => {
  Object.assign(form, investor);
  Object.assign(docForm, { propertyId: null, investorId: investor.id, title: "", fileUrl: "" });
};

const newInvestor = () => {
  Object.assign(form, { id: "", name: "", email: "", phone: "", memberSince: "", status: "active" });
};

const runSave = async (action) => {
  saving.value = true;
  error.value = "";
  try {
    await action();
  } catch (err) {
    error.value = err.message || "Unable to save changes.";
  } finally {
    saving.value = false;
  }
};

const saveInvestor = async () => {
  const wasNew = !form.id;
  await runSave(() => store.upsertInvestor(form));
  if (!error.value && wasNew) selectInvestor(state.investors[0]);
};

const assignmentCount = (id) => state.investorProperties.filter((item) => item.investorId === id).length;
const isAssigned = (propertyId) => state.investorProperties.some((item) => item.investorId === form.id && item.propertyId === propertyId);
const investorDocuments = computed(() => (form.id ? store.documentsForInvestor(form.id) : []));

const toggleProperty = (propertyId, assigned) => runSave(() => store.setInvestorProperty(form.id, propertyId, assigned));
const deleteDocument = (id) => runSave(() => store.deleteDocument(id));

const addInvestorDocument = async () => {
  docForm.investorId = form.id;
  await runSave(() => store.addDocument(docForm));
  if (!error.value) Object.assign(docForm, { propertyId: null, investorId: form.id, title: "", fileUrl: "" });
};

if (state.investors[0]) selectInvestor(state.investors[0]);
</script>
