<template>
  <main class="flex min-h-[calc(100dvh-1.4rem)] flex-1 flex-col overflow-auto bg-stone-50">
    <div class="shrink-0 border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">Properties</h1>
          <p class="mt-1 text-sm text-stone-500">Create and maintain investor-facing project records.</p>
        </div>
        <button class="btn-gold" @click="openCreateModal">
          <Plus class="h-4 w-4" />
          Create property
        </button>
      </div>
    </div>

    <div class="flex flex-1 flex-col px-6 py-8 lg:px-10">
      <div class="mb-5 grid shrink-0 gap-3 lg:grid-cols-2">
        <select v-model="statusFilter" class="field">
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status">{{ status }}</option>
        </select>
        <select v-model="categoryFilter" class="field">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category">{{ category }}</option>
        </select>
      </div>

      <div class="card flex flex-1 overflow-hidden">
        <div class="w-full overflow-x-auto">
          <table class="w-full min-w-[920px]">
            <thead class="bg-stone-50">
              <tr class="border-b border-stone-200">
                <th class="label px-5 py-3 text-left">Title</th>
                <th class="label px-5 py-3 text-left">Location</th>
                <th class="label px-5 py-3 text-left">Category</th>
                <th class="label px-5 py-3 text-left">Status</th>
                <th class="label px-5 py-3 text-left">Progress</th>
                <th class="label px-5 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="property in filtered" :key="property.id" class="cursor-pointer border-b border-stone-100 hover:bg-stone-50/70" @click="$router.push(`/dashboard/properties/${property.id}`)">
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm" @click.self="closeCreateModal">
        <form class="card w-full max-w-3xl p-6 shadow-2xl" @submit.prevent="createProperty">
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <p class="label mb-2">New property</p>
              <h2 class="text-2xl font-semibold tracking-tight text-stone-950">Create property</h2>
              <p class="mt-1 text-sm text-stone-500">Add an investor-facing project record.</p>
            </div>
            <button class="btn-outline h-10 w-10 !min-h-10 !p-0" type="button" aria-label="Close create property modal" @click="closeCreateModal">
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 md:col-span-2">{{ error }}</div>
            <input v-model="form.title" class="field md:col-span-2" placeholder="Title" />
            <input v-model="form.location" class="field" placeholder="Location" />
            <select v-model="form.category" class="field">
              <option>Real Estate Development</option>
              <option>Residential Development</option>
              <option>Infrastructure</option>
            </select>
            <select v-model="form.status" class="field">
              <option>Under Construction</option>
              <option>Foundation Phase</option>
              <option>Finishing Works</option>
              <option>Completed</option>
            </select>
            <input v-model.number="form.progressPercent" class="field" min="0" max="100" type="number" placeholder="Progress %" />
            <input v-model="form.estCompletionDate" class="field" type="date" />
            <div class="md:col-span-2">
              <div class="mb-2 flex items-center justify-between gap-3">
                <label class="label block">Cover image</label>
                <label class="btn-outline min-h-10 cursor-pointer">
                  <ImagePlus class="h-4 w-4" />
                  {{ coverUploading ? "Uploading..." : "Upload image" }}
                  <input class="sr-only" type="file" accept="image/*" :disabled="coverUploading || saving" @change="uploadCoverImage" />
                </label>
              </div>
              <div v-if="form.coverImageUrl" class="mt-3 h-32 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                <img :src="form.coverImageUrl" alt="" class="h-full w-full object-cover" />
              </div>
              <div v-else class="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                Upload a cover image for the project.
              </div>
            </div>
            <textarea v-model="form.description" class="field md:col-span-2" rows="4" placeholder="Description"></textarea>

            <div class="md:col-span-2">
              <div class="mb-2 flex items-center justify-between gap-3">
                <label class="label block">Property documents</label>
                <label class="btn-outline min-h-10 cursor-pointer">
                  <Upload class="h-4 w-4" />
                  {{ documentsUploading ? "Uploading..." : "Upload files" }}
                  <input class="sr-only" type="file" multiple :disabled="documentsUploading || saving" @change="uploadDocuments" />
                </label>
              </div>
              <div v-if="pendingDocuments.length" class="space-y-2 rounded-2xl border border-stone-100 bg-stone-50 p-3">
                <div v-for="document in pendingDocuments" :key="document.fileUrl" class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-stone-800">{{ document.title }}</p>
                    <p class="truncate text-xs text-stone-400">{{ document.fileUrl }}</p>
                  </div>
                  <button class="text-xs font-semibold text-red-600" type="button" @click="removePendingDocument(document.fileUrl)">Remove</button>
                </div>
              </div>
              <p v-else class="rounded-2xl border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-500">
                Upload receipts, certificates, progress reports, and other documents for this property.
              </p>
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button class="btn-outline" type="button" @click="closeCreateModal">Cancel</button>
            <button class="btn-gold" type="submit" :disabled="saving || coverUploading || documentsUploading">{{ saving ? "Saving..." : "Save property" }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImagePlus, Plus, Upload, X } from "@lucide/vue";
import { state, store, uploadAdminFile } from "../stores/adminStore";

const showCreate = ref(false);
const statusFilter = ref("");
const categoryFilter = ref("");
const saving = ref(false);
const coverUploading = ref(false);
const documentsUploading = ref(false);
const error = ref("");
const pendingDocuments = ref([]);
const router = useRouter();
const route = useRoute();
const form = reactive({ title: "", location: "", category: "Real Estate Development", status: "Under Construction", progressPercent: 0, estCompletionDate: "", coverImageUrl: "", description: "" });

const statuses = computed(() => [...new Set(state.properties.map((item) => item.status))]);
const categories = computed(() => [...new Set(state.properties.map((item) => item.category))]);
const filtered = computed(() => state.properties.filter((item) => (!statusFilter.value || item.status === statusFilter.value) && (!categoryFilter.value || item.category === categoryFilter.value)));
const resetForm = () => {
  Object.assign(form, { title: "", location: "", category: "Real Estate Development", status: "Under Construction", progressPercent: 0, estCompletionDate: "", coverImageUrl: "", description: "" });
  pendingDocuments.value = [];
};

const openCreateModal = () => {
  error.value = "";
  showCreate.value = true;
};

const closeCreateModal = () => {
  if (saving.value || coverUploading.value || documentsUploading.value) return;
  error.value = "";
  showCreate.value = false;
};

const uploadCoverImage = async (event) => {
  const [file] = event.target.files || [];
  event.target.value = "";
  if (!file) return;

  coverUploading.value = true;
  error.value = "";
  try {
    form.coverImageUrl = await uploadAdminFile(file, "properties/covers");
  } catch (err) {
    error.value = err.message || "Unable to upload cover image.";
  } finally {
    coverUploading.value = false;
  }
};

const uploadDocuments = async (event) => {
  const files = [...(event.target.files || [])];
  event.target.value = "";
  if (!files.length) return;

  documentsUploading.value = true;
  error.value = "";
  try {
    for (const file of files) {
      const fileUrl = await uploadAdminFile(file, "properties/documents");
      pendingDocuments.value.push({
        title: file.name.replace(/\.[^.]+$/, ""),
        fileUrl,
      });
    }
  } catch (err) {
    error.value = err.message || "Unable to upload property documents.";
  } finally {
    documentsUploading.value = false;
  }
};

const removePendingDocument = (fileUrl) => {
  pendingDocuments.value = pendingDocuments.value.filter((document) => document.fileUrl !== fileUrl);
};

watch(
  () => route.query.mode,
  (mode) => {
    if (mode === "create") showCreate.value = true;
  },
  { immediate: true },
);

const createProperty = async () => {
  saving.value = true;
  error.value = "";
  try {
    const created = await store.createProperty(form);
    for (const document of pendingDocuments.value) {
      await store.addDocument({
        propertyId: created.id,
        investorId: null,
        title: document.title,
        fileUrl: document.fileUrl,
      });
    }
    resetForm();
    showCreate.value = false;
    router.push(`/dashboard/properties/${created.id}`);
  } catch (err) {
    error.value = err.message || "Unable to save property.";
  } finally {
    saving.value = false;
  }
};

const formatDate = (value) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
</script>
