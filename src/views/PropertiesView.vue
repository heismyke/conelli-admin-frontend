<template>
  <main class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Properties</h1>
          <p class="mt-1 text-sm text-stone-500">Create and maintain investor-facing project records.</p>
        </div>
        <button class="btn-gold" @click="startCreate">
          <Plus class="h-4 w-4" />
          Create property
        </button>
      </div>
    </div>

    <div class="px-6 py-8 lg:px-10">
      <form v-if="showForm" class="card mb-6 grid gap-4 p-5 lg:grid-cols-4" @submit.prevent="saveProperty">
        <div class="flex items-center justify-between lg:col-span-4">
          <div>
            <p class="label mb-1">{{ editingId ? "Edit property" : "New property" }}</p>
            <h2 class="text-xl font-semibold text-stone-950">{{ editingId ? form.title || "Update property" : "Create property" }}</h2>
          </div>
          <button class="btn-outline min-h-10 px-4 text-[10px]" type="button" @click="resetForm">
            <X class="h-4 w-4" />
            Close
          </button>
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 lg:col-span-4">{{ error }}</div>

        <label class="lg:col-span-2">
          <span class="label mb-2 block">Title</span>
          <input v-model="form.title" class="field" placeholder="Property title" />
        </label>
        <label>
          <span class="label mb-2 block">Location</span>
          <input v-model="form.location" class="field" placeholder="Location" />
        </label>
        <label>
          <span class="label mb-2 block">Category</span>
          <select v-model="form.category" class="field">
            <option v-for="category in categoryOptions" :key="category">{{ category }}</option>
          </select>
        </label>
        <label>
          <span class="label mb-2 block">Status</span>
          <select v-model="form.status" class="field">
            <option v-for="status in statusOptions" :key="status">{{ status }}</option>
          </select>
        </label>
        <label>
          <span class="label mb-2 block">Progress</span>
          <input v-model.number="form.progressPercent" class="field" min="0" max="100" type="number" placeholder="Progress %" />
        </label>
        <label>
          <span class="label mb-2 block">Est. completion</span>
          <input v-model="form.estCompletionDate" class="field" type="date" />
        </label>
        <label>
          <span class="label mb-2 block">Cover image</span>
          <input v-model="form.coverImageUrl" class="field" placeholder="Cover image URL" />
        </label>
        <label class="lg:col-span-3">
          <span class="label mb-2 block">Description</span>
          <textarea v-model="form.description" class="field" rows="2" placeholder="Description"></textarea>
        </label>
        <div class="flex items-end gap-3">
          <button class="btn-gold w-full" type="submit" :disabled="saving">
            <Save class="h-4 w-4" />
            {{ saving ? "Saving..." : editingId ? "Update property" : "Save property" }}
          </button>
        </div>
      </form>

      <div class="mb-5 flex flex-col gap-3 lg:flex-row">
        <select v-model="statusFilter" class="field lg:w-56">
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status">{{ status }}</option>
        </select>
        <select v-model="categoryFilter" class="field lg:w-64">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category">{{ category }}</option>
        </select>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1040px]">
            <thead class="bg-stone-50">
              <tr class="border-b border-stone-200">
                <th class="label px-5 py-3 text-left">Title</th>
                <th class="label px-5 py-3 text-left">Location</th>
                <th class="label px-5 py-3 text-left">Category</th>
                <th class="label px-5 py-3 text-left">Status</th>
                <th class="label px-5 py-3 text-left">Progress</th>
                <th class="label px-5 py-3 text-left">Updated</th>
                <th class="label px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="property in filtered" :key="property.id" class="border-b border-stone-100 last:border-0 hover:bg-stone-50/70">
                <td class="px-5 py-4 text-sm font-medium text-stone-900">{{ property.title }}</td>
                <td class="px-5 py-4 text-sm text-stone-600">{{ property.location }}</td>
                <td class="px-5 py-4 text-sm text-stone-600">{{ property.category }}</td>
                <td class="px-5 py-4"><span class="badge">{{ property.status }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-1.5 w-24 overflow-hidden rounded-full bg-stone-100">
                      <div class="h-1.5 bg-stone-900" :style="`width: ${property.progressPercent}%`"></div>
                    </div>
                    <span class="text-xs text-stone-500">{{ property.progressPercent }}%</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-xs text-stone-500">{{ formatDate(property.updatedAt) }}</td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <button class="icon-btn h-10 w-10" type="button" title="View property" @click="$router.push(`/dashboard/properties/${property.id}`)">
                      <Eye class="h-4 w-4" />
                    </button>
                    <button class="icon-btn h-10 w-10" type="button" title="Edit property" @click="startEdit(property)">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      class="icon-btn h-10 w-10 text-red-600 hover:border-red-200 hover:bg-red-50"
                      type="button"
                      title="Delete property"
                      :disabled="deletingId === property.id"
                      @click="deleteProperty(property)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filtered.length === 0" class="px-5 py-12 text-center">
          <p class="text-sm text-stone-500">No properties match the selected filters.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { Eye, Pencil, Plus, Save, Trash2, X } from "@lucide/vue";
import { state, store } from "../stores/adminStore";

const blankForm = () => ({
  title: "",
  location: "",
  category: "Real Estate Development",
  status: "Under Construction",
  progressPercent: 0,
  estCompletionDate: "",
  coverImageUrl: "",
  description: "",
});

const categoryOptions = ["Real Estate Development", "Residential Development", "Infrastructure"];
const statusOptions = ["Under Construction", "Foundation Phase", "Finishing Works", "Completed"];

const showForm = ref(false);
const editingId = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");
const saving = ref(false);
const deletingId = ref("");
const error = ref("");
const form = reactive(blankForm());

const statuses = computed(() => [...new Set([...statusOptions, ...state.properties.map((item) => item.status)])]);
const categories = computed(() => [...new Set([...categoryOptions, ...state.properties.map((item) => item.category)])]);
const filtered = computed(() => state.properties.filter((item) => (!statusFilter.value || item.status === statusFilter.value) && (!categoryFilter.value || item.category === categoryFilter.value)));

const fillForm = (payload) => {
  Object.assign(form, blankForm(), payload);
};

const startCreate = () => {
  editingId.value = "";
  error.value = "";
  fillForm(blankForm());
  showForm.value = true;
};

const startEdit = (property) => {
  editingId.value = property.id;
  error.value = "";
  fillForm({
    title: property.title,
    location: property.location,
    category: property.category,
    status: property.status,
    progressPercent: property.progressPercent,
    estCompletionDate: property.estCompletionDate,
    coverImageUrl: property.coverImageUrl,
    description: property.description,
  });
  showForm.value = true;
};

const resetForm = () => {
  showForm.value = false;
  editingId.value = "";
  error.value = "";
  fillForm(blankForm());
};

const propertyPayload = () => ({
  title: form.title,
  location: form.location,
  category: form.category,
  status: form.status,
  progressPercent: Math.max(0, Math.min(100, Number(form.progressPercent || 0))),
  estCompletionDate: form.estCompletionDate,
  coverImageUrl: form.coverImageUrl,
  description: form.description,
});

const saveProperty = async () => {
  saving.value = true;
  error.value = "";
  try {
    if (editingId.value) await store.updateProperty(editingId.value, propertyPayload());
    else await store.createProperty(propertyPayload());
    resetForm();
  } catch (err) {
    error.value = err.message || "Unable to save property.";
  } finally {
    saving.value = false;
  }
};

const deleteProperty = async (property) => {
  const confirmed = window.confirm(`Delete "${property.title}"? This also removes its investor assignments, updates, milestones, materials, and property documents.`);
  if (!confirmed) return;

  deletingId.value = property.id;
  error.value = "";
  try {
    await store.deleteProperty(property.id);
    if (editingId.value === property.id) resetForm();
  } catch (err) {
    error.value = err.message || "Unable to delete property.";
    showForm.value = true;
  } finally {
    deletingId.value = "";
  }
};

const formatDate = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
</script>
