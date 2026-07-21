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
              <span class="label mb-2 block">Password</span>
              <input
                v-model="form.password"
                class="field"
                type="password"
                :placeholder="form.id ? 'Leave blank to keep current password' : 'Required for new investor'"
                autocomplete="new-password"
              />
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

            <section class="lg:col-span-2">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="label mb-1">Payments and receipts</h3>
                  <p class="text-xs text-stone-500">Capture homeowner payments and attach receipts to each payment record.</p>
                </div>
                <span class="badge">{{ selectedPropertyPayments.length }} payments</span>
              </div>

              <div v-if="assignedProperties.length" class="grid gap-4 lg:grid-cols-[320px_1fr]">
                <form class="grid gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4" @submit.prevent="savePayment">
                  <label>
                    <span class="label mb-2 block">Property</span>
                    <select v-model="paymentForm.propertyId" class="field">
                      <option v-for="property in assignedProperties" :key="property.id" :value="property.id">
                        {{ property.title }}
                      </option>
                    </select>
                  </label>
                  <label>
                    <span class="label mb-2 block">Description</span>
                    <input v-model="paymentForm.description" class="field" placeholder="Initial property payment" />
                  </label>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span class="label mb-2 block">Amount</span>
                      <input v-model.number="paymentForm.amount" class="field" type="number" min="0" placeholder="0" />
                    </label>
                    <label>
                      <span class="label mb-2 block">Date</span>
                      <input v-model="paymentForm.paymentDate" class="field" type="date" />
                    </label>
                  </div>
                  <label>
                    <span class="label mb-2 block">Status</span>
                    <select v-model="paymentForm.status" class="field">
                      <option value="paid">paid</option>
                      <option value="pending">pending</option>
                      <option value="failed">failed</option>
                    </select>
                  </label>
                  <label class="btn-outline cursor-pointer justify-center">
                    <Upload class="h-4 w-4" />
                    {{ receiptUploadingId === "new" ? "Uploading..." : paymentForm.receiptUrl ? "Replace receipt" : "Attach receipt" }}
                    <input class="sr-only" type="file" accept="image/*,.pdf" :disabled="receiptUploadingId === 'new' || saving" @change="uploadNewPaymentReceipt" />
                  </label>
                  <p v-if="paymentForm.receiptUrl" class="truncate text-xs text-stone-500">{{ paymentForm.receiptUrl }}</p>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <button class="btn-gold" type="submit" :disabled="saving || receiptUploadingId === 'new'">
                      <Save class="h-4 w-4" />
                      {{ paymentForm.id ? "Save payment" : "Add payment" }}
                    </button>
                    <button class="btn-outline" type="button" @click="resetPaymentForm">Clear</button>
                  </div>
                </form>

                <div class="overflow-hidden rounded-2xl border border-stone-100">
                  <div v-for="payment in selectedPropertyPayments" :key="payment.id" class="grid gap-3 border-b border-stone-100 px-4 py-3 last:border-0 md:grid-cols-[1fr_auto] md:items-center">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-stone-900">{{ payment.description }}</p>
                      <p class="mt-1 text-xs text-stone-500">{{ formatDate(payment.paymentDate) }} · {{ formatNaira(payment.amount) }}</p>
                      <a v-if="payment.receiptUrl" class="mt-1 block truncate text-xs font-semibold text-stone-700 underline" :href="payment.receiptUrl" target="_blank" rel="noreferrer">
                        View receipt
                      </a>
                      <p v-else class="mt-1 text-xs text-stone-400">No receipt attached.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 md:justify-end">
                      <span class="badge">{{ payment.status }}</span>
                      <button class="btn-outline min-h-9 px-3 text-[10px]" type="button" @click="editPayment(payment)">Edit</button>
                      <label class="btn-outline min-h-9 cursor-pointer px-3 text-[10px]">
                        {{ receiptUploadingId === payment.id ? "Uploading..." : payment.receiptUrl ? "Replace receipt" : "Attach receipt" }}
                        <input class="sr-only" type="file" accept="image/*,.pdf" :disabled="receiptUploadingId === payment.id || saving" @change="attachReceiptToPayment(payment, $event)" />
                      </label>
                      <button class="text-xs font-semibold text-red-600" type="button" @click="deletePayment(payment.id)">Delete</button>
                    </div>
                  </div>
                  <p v-if="selectedPropertyPayments.length === 0" class="px-4 py-8 text-center text-xs text-stone-500">
                    No payments recorded for this property yet.
                  </p>
                </div>
              </div>

              <div v-else class="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                Assign at least one property before recording payments.
              </div>
            </section>
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
import { state, store, uploadAdminFile } from "../stores/adminStore";

const blankInvestor = () => ({ id: "", name: "", email: "", phone: "", memberSince: "", status: "active", password: "" });
const blankPayment = () => ({ id: "", investorId: "", propertyId: "", description: "", amount: null, paymentDate: new Date().toISOString().slice(0, 10), status: "paid", receiptUrl: "" });

const form = reactive(blankInvestor());
const docForm = reactive({ propertyId: null, investorId: "", title: "", fileUrl: "" });
const paymentForm = reactive(blankPayment());
const saving = ref(false);
const deletingId = ref("");
const receiptUploadingId = ref("");
const error = ref("");
const route = useRoute();

const fillInvestor = (payload) => {
  const { passwordHash: _passwordHash, password: _password, ...safePayload } = payload || {};
  Object.assign(form, blankInvestor(), safePayload, { password: "" });
};

const selectInvestor = (investor) => {
  fillInvestor(investor);
  Object.assign(docForm, { propertyId: null, investorId: investor.id, title: "", fileUrl: "" });
  resetPaymentForm(investor.id);
  error.value = "";
};

const startCreate = () => {
  fillInvestor(blankInvestor());
  Object.assign(docForm, { propertyId: null, investorId: "", title: "", fileUrl: "" });
  Object.assign(paymentForm, blankPayment());
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
const assignedProperties = computed(() => state.investorProperties
  .filter((item) => item.investorId === form.id)
  .map((item) => store.propertyById(item.propertyId))
  .filter(Boolean));
const selectedPropertyPayments = computed(() => (form.id && paymentForm.propertyId ? store.paymentsForInvestorProperty(form.id, paymentForm.propertyId) : []));

const toggleProperty = async (propertyId, assigned) => {
  await runSave(() => store.setInvestorProperty(form.id, propertyId, assigned));
  if (!paymentForm.propertyId || !isAssigned(paymentForm.propertyId)) {
    paymentForm.propertyId = assignedProperties.value[0]?.id || "";
  }
};
const deleteDocument = (id) => runSave(() => store.deleteDocument(id));

const addInvestorDocument = async () => {
  docForm.investorId = form.id;
  const saved = await runSave(() => store.addDocument(docForm));
  if (!error.value || saved !== null) Object.assign(docForm, { propertyId: null, investorId: form.id, title: "", fileUrl: "" });
};

const resetPaymentForm = (investorId = form.id) => Object.assign(paymentForm, blankPayment(), {
  investorId,
  propertyId: assignedProperties.value[0]?.id || "",
});

const editPayment = (payment) => Object.assign(paymentForm, {
  id: payment.id,
  investorId: payment.investorId,
  propertyId: payment.propertyId,
  description: payment.description,
  amount: payment.amount,
  paymentDate: payment.paymentDate || payment.date || new Date().toISOString().slice(0, 10),
  status: payment.status || "paid",
  receiptUrl: payment.receiptUrl || "",
});

const savePayment = async () => {
  paymentForm.investorId = form.id;
  const saved = await runSave(() => store.upsertPayment(paymentForm));
  if (saved) resetPaymentForm(form.id);
};

const deletePayment = async (id) => {
  const confirmed = window.confirm("Delete this payment record?");
  if (!confirmed) return;
  await runSave(() => store.deletePayment(id));
  if (paymentForm.id === id) resetPaymentForm(form.id);
};

const uploadNewPaymentReceipt = async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  receiptUploadingId.value = "new";
  error.value = "";
  try {
    paymentForm.receiptUrl = await uploadAdminFile(file, `payments/${form.id}/${paymentForm.propertyId || "receipts"}`);
  } catch (err) {
    error.value = err.message || "Unable to upload payment receipt.";
  } finally {
    receiptUploadingId.value = "";
    event.target.value = "";
  }
};

const attachReceiptToPayment = async (payment, event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  receiptUploadingId.value = payment.id;
  error.value = "";
  try {
    const receiptUrl = await uploadAdminFile(file, `payments/${payment.investorId}/${payment.propertyId}`);
    await store.upsertPayment({ ...payment, receiptUrl });
  } catch (err) {
    error.value = err.message || "Unable to attach payment receipt.";
  } finally {
    receiptUploadingId.value = "";
    event.target.value = "";
  }
};

const formatNaira = (value) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Not dated";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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
