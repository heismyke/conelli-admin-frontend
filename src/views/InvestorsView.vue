<template>
  <main class="flex min-h-[calc(100dvh-1.4rem)] flex-1 flex-col overflow-auto bg-stone-50">
    <div class="shrink-0 border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Investors</h1>
          <p class="mt-1 text-sm text-stone-500">Manage investor details, property visibility, and investor documents.</p>
        </div>
        <button class="btn-gold" @click="startCreate">
          <Plus class="h-4 w-4" />
          New investor
        </button>
      </div>
    </div>

    <div class="grid flex-1 gap-6 px-6 py-8 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div class="card flex min-h-[360px] overflow-hidden lg:min-h-0">
        <div class="w-full overflow-x-auto">
          <table class="w-full min-w-[720px]">
            <thead class="bg-stone-50">
              <tr class="border-b border-stone-200">
                <th class="label px-5 py-3 text-left">Name</th>
                <th class="label px-5 py-3 text-left">Properties</th>
                <th class="label px-5 py-3 text-left">Status</th>
                <th class="label px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="investor in state.investors"
                :key="investor.id"
                class="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                :class="{ 'bg-stone-50': form.id === investor.id }"
              >
                <td class="px-5 py-4">
                  <p class="text-sm font-medium text-stone-900">{{ investor.name }}</p>
                  <p class="text-xs text-stone-500">{{ investor.email }}</p>
                </td>
                <td class="px-5 py-4 text-sm text-stone-600">{{ assignmentCount(investor.id) }}</td>
                <td class="px-5 py-4"><span class="badge">{{ investor.status }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <button class="icon-btn h-10 w-10" type="button" title="Edit investor" @click="selectInvestor(investor)">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      class="icon-btn h-10 w-10 text-red-600 hover:border-red-200 hover:bg-red-50"
                      type="button"
                      title="Delete investor"
                      :disabled="deletingId === investor.id"
                      @click="deleteInvestor(investor)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="state.investors.length === 0" class="px-5 py-12 text-center">
          <p class="text-sm text-stone-500">No investors have been created yet.</p>
        </div>
      </div>

      <section class="card flex min-h-[520px] flex-col overflow-hidden p-5 lg:min-h-0">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <p class="label mb-1">{{ form.id ? "Edit investor" : "New investor" }}</p>
            <h2 class="text-xl font-semibold text-stone-950">{{ form.id ? form.name || "Update investor" : "Create investor" }}</h2>
          </div>
          <button v-if="form.id" class="btn-outline min-h-10 px-4 text-[10px]" type="button" @click="startCreate">
            <Plus class="h-4 w-4" />
            New
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto pr-1">
          <form class="mb-6 grid gap-4 lg:grid-cols-2" @submit.prevent="saveInvestor">
            <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 lg:col-span-2">{{ error }}</div>
            <label>
              <span class="label mb-2 block">Name</span>
              <input v-model="form.name" class="field" placeholder="Investor name" />
            </label>
            <label>
              <span class="label mb-2 block">Email</span>
              <input v-model="form.email" class="field" type="email" placeholder="email@example.com" />
            </label>
            <label>
              <span class="label mb-2 block">Phone</span>
              <input v-model="form.phone" class="field" placeholder="+234..." />
            </label>
            <label>
              <span class="label mb-2 block">Member since</span>
              <input v-model="form.memberSince" class="field" type="date" />
            </label>
            <label>
              <span class="label mb-2 block">Status</span>
              <select v-model="form.status" class="field">
                <option>active</option>
                <option>inactive</option>
              </select>
            </label>
            <button class="btn-gold self-end" type="submit" :disabled="saving">
              <Save class="h-4 w-4" />
              {{ saving ? "Saving..." : form.id ? "Update investor" : "Save investor" }}
            </button>
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
                <button class="btn-outline" type="submit">
                  <Upload class="h-4 w-4" />
                  Upload document
                </button>
              </form>
              <div class="space-y-2">
                <div v-for="doc in investorDocuments" :key="doc.id" class="flex items-center justify-between gap-4 border border-stone-100 px-3 py-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-stone-800">{{ doc.title }}</p>
                    <p class="truncate text-xs text-stone-500">{{ doc.fileUrl }}</p>
                  </div>
                  <button class="text-xs font-semibold text-red-600" type="button" @click="deleteDocument(doc.id)">Delete</button>
                </div>
                <p v-if="investorDocuments.length === 0" class="text-xs text-stone-500">No investor documents uploaded.</p>
              </div>
            </div>
          </div>

          <div v-else class="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-5 text-sm text-stone-500">
            Save the investor before assigning property access or uploading investor documents.
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Pencil, Plus, Save, Trash2, Upload } from "@lucide/vue";
import { state, store } from "../stores/adminStore";

const blankInvestor = () => ({ id: "", name: "", email: "", phone: "", memberSince: "", status: "active" });

const form = reactive(blankInvestor());
const docForm = reactive({ propertyId: null, investorId: "", title: "", fileUrl: "" });
const saving = ref(false);
const deletingId = ref("");
const error = ref("");
const route = useRoute();

const fillInvestor = (payload) => {
  Object.assign(form, blankInvestor(), payload);
};

const selectInvestor = (investor) => {
  fillInvestor(investor);
  Object.assign(docForm, { propertyId: null, investorId: investor.id, title: "", fileUrl: "" });
  error.value = "";
};

const startCreate = () => {
  fillInvestor(blankInvestor());
  Object.assign(docForm, { propertyId: null, investorId: "", title: "", fileUrl: "" });
  error.value = "";
};

const runSave = async (action) => {
  saving.value = true;
  error.value = "";
  try {
    return await action();
  } catch (err) {
    error.value = err.message || "Unable to save changes.";
    return null;
  } finally {
    saving.value = false;
  }
};

const saveInvestor = async () => {
  const saved = await runSave(() => store.upsertInvestor({ ...form }));
  if (saved) selectInvestor(saved);
};

const deleteInvestor = async (investor) => {
  const confirmed = window.confirm(`Delete "${investor.name}"? This also removes property access and investor documents.`);
  if (!confirmed) return;

  deletingId.value = investor.id;
  error.value = "";
  try {
    await store.deleteInvestor(investor.id);
    if (form.id === investor.id) {
      const next = state.investors[0];
      if (next) selectInvestor(next);
      else startCreate();
    }
  } catch (err) {
    error.value = err.message || "Unable to delete investor.";
  } finally {
    deletingId.value = "";
  }
};

const assignmentCount = (id) => state.investorProperties.filter((item) => item.investorId === id).length;
const isAssigned = (propertyId) => state.investorProperties.some((item) => item.investorId === form.id && item.propertyId === propertyId);
const investorDocuments = computed(() => (form.id ? store.documentsForInvestor(form.id) : []));

const toggleProperty = (propertyId, assigned) => runSave(() => store.setInvestorProperty(form.id, propertyId, assigned));
const deleteDocument = (id) => runSave(() => store.deleteDocument(id));

const addInvestorDocument = async () => {
  docForm.investorId = form.id;
  const saved = await runSave(() => store.addDocument(docForm));
  if (!error.value || saved !== null) Object.assign(docForm, { propertyId: null, investorId: form.id, title: "", fileUrl: "" });
};

watch(
  () => [route.query.mode, route.query.investor],
  ([mode, investorId]) => {
    if (mode === "create") {
      startCreate();
      return;
    }
    if (investorId) {
      const investor = state.investors.find((item) => item.id === investorId);
      if (investor) {
        selectInvestor(investor);
        return;
      }
    }
    if (!form.id && state.investors[0]) selectInvestor(state.investors[0]);
  },
  { immediate: true },
);
</script>
