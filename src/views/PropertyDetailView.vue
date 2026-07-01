<template>
  <main v-if="property" class="flex-1 overflow-auto bg-stone-50">
    <div class="border-b border-stone-200 bg-white px-6 py-6 lg:px-10">
      <button class="mb-2 text-xs text-stone-500 hover:text-stone-900" @click="$router.push('/dashboard/properties')">← Properties</button>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="font-display text-3xl font-light text-stone-900">{{ property.title }}</h1>
          <p class="mt-1 text-sm text-stone-500">{{ property.location }} · {{ property.category }}</p>
        </div>
        <span class="badge">{{ property.status }} · {{ property.progressPercent }}%</span>
      </div>
    </div>

    <div class="grid gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
      <form class="card grid gap-4 p-5" @submit.prevent="saveProperty">
        <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>
        <div class="grid gap-4 lg:grid-cols-2">
          <div><label class="label mb-2 block">Title</label><input v-model="edit.title" class="field" /></div>
          <div><label class="label mb-2 block">Location</label><input v-model="edit.location" class="field" /></div>
          <div><label class="label mb-2 block">Category</label><input v-model="edit.category" class="field" /></div>
          <div><label class="label mb-2 block">Status</label><input v-model="edit.status" class="field" /></div>
          <div><label class="label mb-2 block">Progress %</label><input v-model.number="edit.progressPercent" type="number" min="0" max="100" class="field" /></div>
          <div><label class="label mb-2 block">Est. completion</label><input v-model="edit.estCompletionDate" type="date" class="field" /></div>
        </div>
        <div>
          <label class="label mb-2 block">Cover image URL</label>
          <input v-model="edit.coverImageUrl" class="field" />
          <div class="mt-3 h-36 overflow-hidden border border-stone-200 bg-stone-100">
            <img :src="edit.coverImageUrl" class="h-full w-full object-cover" alt="" />
          </div>
        </div>
        <div><label class="label mb-2 block">Description</label><textarea v-model="edit.description" rows="4" class="field"></textarea></div>
        <button class="btn-gold justify-self-start" type="submit" :disabled="saving">{{ saving ? "Saving..." : "Save core fields" }}</button>
      </form>

      <section class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Documents</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="addDocument">
          <input v-model="docForm.title" class="field" placeholder="Document title" />
          <input v-model="docForm.fileUrl" class="field" placeholder="File URL or uploaded path" />
          <div class="h-1 overflow-hidden rounded-full bg-stone-100">
            <div class="h-1 bg-stone-900" :style="`width: ${uploadProgress}%`"></div>
          </div>
          <button class="btn-outline" type="submit">Upload document</button>
        </form>
        <div class="space-y-2">
          <div v-for="doc in documents" :key="doc.id" class="flex items-center justify-between border border-stone-100 px-3 py-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-stone-800">{{ doc.title }}</p>
              <p class="text-xs text-stone-400">{{ doc.fileUrl }}</p>
            </div>
                <button class="text-xs text-red-600" @click="deleteDocument(doc.id)">Delete</button>
          </div>
        </div>
      </section>
    </div>

    <div class="grid gap-6 px-6 pb-8 lg:grid-cols-3 lg:px-10">
      <section class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Updates</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="saveUpdate">
          <input v-model="updateForm.title" class="field" placeholder="Update title" />
          <textarea v-model="updateForm.body" class="field" rows="3" placeholder="Update body"></textarea>
          <button class="btn-outline" type="submit">{{ updateForm.id ? "Save update" : "Add update" }}</button>
        </form>
        <div class="space-y-3">
          <article v-for="update in updates" :key="update.id" class="border-b border-stone-100 pb-3">
            <p class="text-sm font-medium text-stone-900">{{ update.title }}</p>
            <p class="mt-1 text-xs leading-relaxed text-stone-500">{{ update.body }}</p>
            <div class="mt-2 flex gap-3 text-xs">
              <button class="text-stone-600" @click="Object.assign(updateForm, update)">Edit</button>
              <button class="text-red-600" @click="deleteUpdate(update.id)">Delete</button>
            </div>
          </article>
        </div>
      </section>

      <section class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Milestones</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="saveMilestone">
          <input v-model="milestoneForm.title" class="field" placeholder="Milestone title" />
          <input v-model="milestoneForm.plannedDate" class="field" type="date" />
          <select v-model="milestoneForm.status" class="field">
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
          <button class="btn-outline" type="submit">Save milestone</button>
        </form>
        <div class="space-y-2">
          <div v-for="milestone in milestones" :key="milestone.id" class="border border-stone-100 px-3 py-2">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-stone-800">{{ milestone.title }}</p>
              <button class="text-xs text-stone-600" @click="Object.assign(milestoneForm, milestone)">Edit</button>
            </div>
            <p class="mt-1 text-xs text-stone-500">{{ milestone.status }} · {{ milestone.plannedDate }}</p>
          </div>
        </div>
      </section>

      <section class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Materials</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="saveMaterial">
          <input v-model="materialForm.materialName" class="field" placeholder="Material" />
          <div class="grid grid-cols-2 gap-3">
            <input v-model.number="materialForm.quantity" class="field" type="number" placeholder="Qty" />
            <input v-model="materialForm.unit" class="field" placeholder="Unit" />
          </div>
          <select v-model="materialForm.status" class="field">
            <option value="ordered">ordered</option>
            <option value="delivered">delivered</option>
            <option value="installed">installed</option>
          </select>
          <button class="btn-outline" type="submit">Save material</button>
        </form>
        <div class="space-y-2">
          <div v-for="material in materials" :key="material.id" class="border border-stone-100 px-3 py-2">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-stone-800">{{ material.materialName }}</p>
              <button class="text-xs text-stone-600" @click="Object.assign(materialForm, material)">Edit</button>
            </div>
            <p class="mt-1 text-xs text-stone-500">{{ material.quantity }} {{ material.unit }} · {{ material.status }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { store } from "../stores/adminStore";

const route = useRoute();
const property = computed(() => store.propertyById(route.params.id));
const edit = reactive({});
const updateForm = reactive({ id: "", propertyId: "", title: "", body: "" });
const milestoneForm = reactive({ id: "", propertyId: "", title: "", plannedDate: "", completedDate: null, status: "pending" });
const materialForm = reactive({ id: "", propertyId: "", materialName: "", quantity: 0, unit: "", status: "ordered" });
const docForm = reactive({ propertyId: "", investorId: null, title: "", fileUrl: "" });
const uploadProgress = ref(0);
const saving = ref(false);
const error = ref("");

watchEffect(() => {
  if (!property.value) return;
  Object.assign(edit, property.value);
  updateForm.propertyId = property.value.id;
  milestoneForm.propertyId = property.value.id;
  materialForm.propertyId = property.value.id;
  docForm.propertyId = property.value.id;
});

const updates = computed(() => (property.value ? store.updatesForProperty(property.value.id) : []));
const milestones = computed(() => (property.value ? store.milestonesForProperty(property.value.id) : []));
const materials = computed(() => (property.value ? store.materialsForProperty(property.value.id) : []));
const documents = computed(() => (property.value ? store.documentsForProperty(property.value.id) : []));

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

const saveProperty = () => runSave(() => store.updateProperty(property.value.id, edit));
const saveUpdate = async () => {
  await runSave(() => store.upsertUpdate(updateForm));
  if (!error.value) Object.assign(updateForm, { id: "", propertyId: property.value.id, title: "", body: "" });
};
const saveMilestone = async () => {
  await runSave(() => store.upsertMilestone(milestoneForm));
  if (!error.value) Object.assign(milestoneForm, { id: "", propertyId: property.value.id, title: "", plannedDate: "", completedDate: null, status: "pending" });
};
const saveMaterial = async () => {
  await runSave(() => store.upsertMaterial(materialForm));
  if (!error.value) Object.assign(materialForm, { id: "", propertyId: property.value.id, materialName: "", quantity: 0, unit: "", status: "ordered" });
};
const addDocument = async () => {
  uploadProgress.value = 100;
  await runSave(() => store.addDocument(docForm));
  if (!error.value) Object.assign(docForm, { propertyId: property.value.id, investorId: null, title: "", fileUrl: "" });
  setTimeout(() => (uploadProgress.value = 0), 600);
};
const deleteDocument = (id) => runSave(() => store.deleteDocument(id));
const deleteUpdate = (id) => runSave(() => store.deleteUpdate(id));
</script>
