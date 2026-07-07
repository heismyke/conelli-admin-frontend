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

    <div class="grid items-start gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
      <form ref="progressSection" class="card grid gap-4 p-5" @submit.prevent="saveProperty">
        <div class="flex items-center justify-between gap-4">
          <h2 class="font-display text-xl font-light text-stone-900">Core fields</h2>
          <button class="text-xs font-semibold text-red-600" type="button" @click="deleteProperty">Delete property</button>
        </div>
        <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ error }}</div>
        <div class="grid gap-4 lg:grid-cols-2">
          <div><label class="label mb-2 block">Title</label><input v-model="edit.title" class="field" /></div>
          <div><label class="label mb-2 block">Location</label><input v-model="edit.location" class="field" /></div>
          <div><label class="label mb-2 block">Category</label><input v-model="edit.category" class="field" /></div>
          <div><label class="label mb-2 block">Status</label><input v-model="edit.status" class="field" /></div>
          <div><label class="label mb-2 block">Progress %</label><input ref="progressInput" v-model.number="edit.progressPercent" type="number" min="0" max="100" class="field" /></div>
          <div><label class="label mb-2 block">Est. completion</label><input v-model="edit.estCompletionDate" type="date" class="field" /></div>
        </div>
        <div>
          <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
            <label class="label block">Cover image</label>
            <div class="flex flex-wrap gap-2">
              <label class="btn-outline cursor-pointer px-4 py-2 text-xs">
                {{ coverUploading ? "Uploading..." : "Upload cover" }}
                <input class="sr-only" type="file" accept="image/*" :disabled="coverUploading || saving" @change="uploadCoverImage" />
              </label>
              <button v-if="edit.coverImageUrl" class="btn-outline px-4 py-2 text-xs" type="button" :disabled="saving" @click="clearCoverImage">Remove cover</button>
            </div>
          </div>
          <div class="h-44 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            <img v-if="edit.coverImageUrl" :src="edit.coverImageUrl" class="h-full w-full object-cover" alt="" />
            <div v-else class="grid h-full place-items-center text-sm text-stone-400">No cover image uploaded.</div>
          </div>
        </div>
        <div><label class="label mb-2 block">Description</label><textarea v-model="edit.description" rows="4" class="field"></textarea></div>
        <div class="border-t border-stone-100 pt-4">
          <h3 class="font-display mb-4 text-lg font-light text-stone-900">Public project content</h3>
          <div class="grid gap-4 lg:grid-cols-2">
            <div><label class="label mb-2 block">Client</label><input v-model="edit.client" class="field" /></div>
            <div><label class="label mb-2 block">Year</label><input v-model="edit.year" class="field" /></div>
            <div class="lg:col-span-2"><label class="label mb-2 block">Tags</label><input v-model="edit.tagsText" class="field" placeholder="Infrastructure, Drainage, FCDA" /></div>
            <div class="lg:col-span-2"><label class="label mb-2 block">Public card description</label><textarea v-model="edit.publicDescription" rows="3" class="field"></textarea></div>
            <div class="lg:col-span-2"><label class="label mb-2 block">Public project overview</label><textarea v-model="edit.publicOverview" rows="5" class="field"></textarea></div>
            <div class="lg:col-span-2">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <label class="label block">Gallery images</label>
                <label class="btn-outline cursor-pointer px-4 py-2 text-xs">
                  {{ galleryUploading ? "Uploading..." : "Upload gallery images" }}
                  <input class="sr-only" type="file" accept="image/*" multiple :disabled="galleryUploading || saving" @change="uploadGalleryImages" />
                </label>
              </div>
              <div v-if="galleryImages.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <article v-for="(image, index) in galleryImages" :key="`${image}-${index}`" class="overflow-hidden rounded-2xl border border-stone-100 bg-white">
                  <div class="h-32 bg-stone-100">
                    <img :src="image" alt="" class="h-full w-full object-cover" />
                  </div>
                  <div class="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <button class="text-stone-600" type="button" @click="setCoverFromGallery(image)">Set as cover</button>
                    <button class="text-red-600" type="button" @click="removeGalleryImage(index)">Delete</button>
                  </div>
                </article>
              </div>
              <div v-else class="rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-400">
                No gallery images uploaded.
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="btn-gold" type="submit" :disabled="saving">{{ saving ? "Saving..." : "Save core fields" }}</button>
          <button class="btn-outline" type="button" @click="resetPropertyForm">Reset changes</button>
        </div>
      </form>

      <section ref="documentsSection" class="card self-start p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Documents</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="saveDocument">
          <input ref="documentInput" v-model="docForm.title" class="field" placeholder="Document title" />
          <input v-model="docForm.fileUrl" class="field" placeholder="File URL or uploaded path" />
          <div class="h-1 overflow-hidden rounded-full bg-stone-100">
            <div class="h-1 bg-stone-900" :style="`width: ${uploadProgress}%`"></div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <button class="btn-outline" type="submit">{{ docForm.id ? "Save document" : "Upload document" }}</button>
            <button class="btn-outline" type="button" @click="resetDocumentForm">Clear</button>
          </div>
        </form>
        <div class="space-y-2">
          <div v-for="doc in documents" :key="doc.id" class="flex items-center justify-between border border-stone-100 px-3 py-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-stone-800">{{ doc.title }}</p>
              <p class="text-xs text-stone-400">{{ doc.fileUrl }}</p>
            </div>
            <div class="flex gap-3 text-xs">
              <button class="text-stone-600" @click="editDocument(doc)">Edit</button>
              <button class="text-red-600" @click="deleteDocument(doc.id)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="grid gap-6 px-6 pb-8 lg:grid-cols-2 lg:px-10">
      <section ref="updatesSection" class="card p-5">
        <h2 class="font-display mb-4 text-xl font-light text-stone-900">Updates</h2>
        <form class="mb-4 grid gap-3" @submit.prevent="saveUpdate">
          <input ref="updateInput" v-model="updateForm.title" class="field" placeholder="Update title" />
          <textarea v-model="updateForm.body" class="field" rows="3" placeholder="Update body"></textarea>
          <div class="grid gap-3 sm:grid-cols-2">
            <button class="btn-outline" type="submit">{{ updateForm.id ? "Save update" : "Add update" }}</button>
            <button class="btn-outline" type="button" @click="resetUpdateForm">Clear</button>
          </div>
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
          <div class="grid gap-3 sm:grid-cols-2">
            <button class="btn-outline" type="submit">{{ milestoneForm.id ? "Save milestone" : "Add milestone" }}</button>
            <button class="btn-outline" type="button" @click="resetMilestoneForm">Clear</button>
          </div>
        </form>
        <div class="space-y-2">
          <div v-for="milestone in milestones" :key="milestone.id" class="border border-stone-100 px-3 py-2">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-stone-800">{{ milestone.title }}</p>
              <div class="flex gap-3 text-xs">
                <button class="text-stone-600" @click="editMilestone(milestone)">Edit</button>
                <button class="text-red-600" @click="deleteMilestone(milestone.id)">Delete</button>
              </div>
            </div>
            <p class="mt-1 text-xs text-stone-500">{{ milestone.status }} · {{ milestone.plannedDate }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { store, uploadAdminFile } from "../stores/adminStore";

const route = useRoute();
const router = useRouter();
const property = computed(() => store.propertyById(route.params.id));
const edit = reactive({});
const updateForm = reactive({ id: "", propertyId: "", title: "", body: "" });
const milestoneForm = reactive({ id: "", propertyId: "", title: "", plannedDate: "", completedDate: null, status: "pending" });
const docForm = reactive({ id: "", propertyId: "", investorId: null, title: "", fileUrl: "" });
const uploadProgress = ref(0);
const coverUploading = ref(false);
const galleryUploading = ref(false);
const saving = ref(false);
const error = ref("");
const progressSection = ref(null);
const documentsSection = ref(null);
const updatesSection = ref(null);
const progressInput = ref(null);
const documentInput = ref(null);
const updateInput = ref(null);

watchEffect(() => {
  if (!property.value) return;
  Object.assign(edit, property.value, {
    tagsText: (property.value.tags || []).join(", "),
    galleryImagesText: (property.value.galleryImages || []).join("\n"),
  });
  updateForm.propertyId = property.value.id;
  milestoneForm.propertyId = property.value.id;
  docForm.propertyId = property.value.id;
});

const updates = computed(() => (property.value ? store.updatesForProperty(property.value.id) : []));
const milestones = computed(() => (property.value ? store.milestonesForProperty(property.value.id) : []));
const documents = computed(() => (property.value ? store.documentsForProperty(property.value.id) : []));
const galleryImages = computed(() => String(edit.galleryImagesText || "").split("\n").map((item) => item.trim()).filter(Boolean));

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

const saveProperty = () => runSave(() => store.updateProperty(property.value.id, {
  ...edit,
  tags: edit.tagsText,
  galleryImages: edit.galleryImagesText,
}));
const resetPropertyForm = () => {
  if (property.value) Object.assign(edit, property.value, {
    tagsText: (property.value.tags || []).join(", "),
    galleryImagesText: (property.value.galleryImages || []).join("\n"),
  });
};
const uploadCoverImage = async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  coverUploading.value = true;
  error.value = "";
  try {
    edit.coverImageUrl = await uploadAdminFile(file, `properties/${property.value.id}/cover`);
  } catch (err) {
    error.value = err.message || "Unable to upload cover image.";
  } finally {
    coverUploading.value = false;
    event.target.value = "";
  }
};
const clearCoverImage = () => {
  edit.coverImageUrl = "";
};
const setCoverFromGallery = (image) => {
  edit.coverImageUrl = image;
};
const removeGalleryImage = (index) => {
  const nextImages = galleryImages.value.filter((_, imageIndex) => imageIndex !== index);
  edit.galleryImagesText = nextImages.join("\n");
};
const uploadGalleryImages = async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  galleryUploading.value = true;
  error.value = "";
  try {
    const uploadedImages = [];
    for (const file of files) {
      uploadedImages.push(await uploadAdminFile(file, `properties/${property.value.id}/gallery`));
    }
    edit.galleryImagesText = [...galleryImages.value, ...uploadedImages].join("\n");
    if (!edit.coverImageUrl && uploadedImages[0]) edit.coverImageUrl = uploadedImages[0];
  } catch (err) {
    error.value = err.message || "Unable to upload gallery images.";
  } finally {
    galleryUploading.value = false;
    event.target.value = "";
  }
};
const deleteProperty = async () => {
  const confirmed = window.confirm(`Delete "${property.value.title}"? This also removes related assignments, updates, milestones, and documents.`);
  if (!confirmed) return;
  await runSave(() => store.deleteProperty(property.value.id));
  if (!error.value) router.push("/dashboard/properties");
};
const resetUpdateForm = () => Object.assign(updateForm, { id: "", propertyId: property.value.id, title: "", body: "" });
const saveUpdate = async () => {
  await runSave(() => store.upsertUpdate(updateForm));
  if (!error.value) resetUpdateForm();
};
const editMilestone = (milestone) => Object.assign(milestoneForm, milestone);
const resetMilestoneForm = () => Object.assign(milestoneForm, { id: "", propertyId: property.value.id, title: "", plannedDate: "", completedDate: null, status: "pending" });
const saveMilestone = async () => {
  await runSave(() => store.upsertMilestone(milestoneForm));
  if (!error.value) resetMilestoneForm();
};
const deleteMilestone = async (id) => {
  await runSave(() => store.deleteMilestone(id));
  if (!error.value && milestoneForm.id === id) resetMilestoneForm();
};
const editDocument = (doc) => Object.assign(docForm, { id: doc.id, propertyId: doc.propertyId, investorId: doc.investorId, title: doc.title, fileUrl: doc.fileUrl });
const resetDocumentForm = () => Object.assign(docForm, { id: "", propertyId: property.value.id, investorId: null, title: "", fileUrl: "" });
const saveDocument = async () => {
  uploadProgress.value = 100;
  await runSave(() => store.upsertDocument(docForm));
  if (!error.value) resetDocumentForm();
  setTimeout(() => (uploadProgress.value = 0), 600);
};
const deleteDocument = async (id) => {
  await runSave(() => store.deleteDocument(id));
  if (!error.value && docForm.id === id) resetDocumentForm();
};
const deleteUpdate = async (id) => {
  await runSave(() => store.deleteUpdate(id));
  if (!error.value && updateForm.id === id) resetUpdateForm();
};

watch(
  () => route.query.focus,
  async (focus) => {
    await nextTick();
    const targets = {
      progress: [progressSection, progressInput],
      documents: [documentsSection, documentInput],
      updates: [updatesSection, updateInput],
    };
    const [section, input] = targets[focus] || [];
    section?.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    input?.value?.focus?.();
  },
  { immediate: true },
);
</script>
