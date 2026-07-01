import { computed, reactive } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

const seedData = () => ({
  users: [
    { id: "user_admin", name: "Ada Okafor", email: "admin@conelliengineering.com", passwordHash: "dev", role: "ADMIN", createdAt: "2026-01-08T09:00:00.000Z" },
    { id: "user_staff", name: "Site Office", email: "staff@conelliengineering.com", passwordHash: "dev", role: "STAFF", createdAt: "2026-01-10T09:00:00.000Z" },
  ],
  investors: [
    { id: "inv_1", name: "Conelli Partner", email: "partner@conelliengineering.com", phone: "+234 800 000 1001", memberSince: "2022-03-01", status: "active" },
    { id: "inv_2", name: "Infrastructure Holdings Ltd", email: "ops@infrastructureholdings.ng", phone: "+234 800 000 1002", memberSince: "2023-06-15", status: "active" },
  ],
  properties: [
    {
      id: "prop_1",
      title: "Real Estate Development, Lifecamp Abuja",
      location: "Lifecamp, Abuja",
      category: "Real Estate Development",
      status: "Under Construction",
      progressPercent: 68,
      estCompletionDate: "2026-12-15",
      coverImageUrl: "/assets/real-estate-lifecamp/lifecamp1.png",
      description: "Luxury residential units with sustainable design principles and modern amenities.",
      createdAt: "2026-01-05T09:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
    },
    {
      id: "prop_2",
      title: "Residential Development, Durumi Abuja",
      location: "Durumi, Abuja",
      category: "Residential Development",
      status: "Foundation Phase",
      progressPercent: 28,
      estCompletionDate: "2027-03-31",
      coverImageUrl: "/assets/residential-durumi/durumi9.jpg",
      description: "Contemporary residential development with high quality finishes for urban living.",
      createdAt: "2026-02-11T09:00:00.000Z",
      updatedAt: "2026-06-18T09:00:00.000Z",
    },
    {
      id: "prop_3",
      title: "Drainage and Manhole Cover Project, FCDA",
      location: "Abuja, Nigeria",
      category: "Infrastructure",
      status: "Finishing Works",
      progressPercent: 91,
      estCompletionDate: "2026-09-30",
      coverImageUrl: "/assets/drainage-manhole-cover-fcda/manhole8.jpg",
      description: "Drainage channels, modern manhole covers, and water management systems across FCDA districts.",
      createdAt: "2026-01-20T09:00:00.000Z",
      updatedAt: "2026-06-22T09:00:00.000Z",
    },
  ],
  investorProperties: [
    { investorId: "inv_1", propertyId: "prop_1", investmentAmount: 125000000, investmentDate: "2022-03-10" },
    { investorId: "inv_1", propertyId: "prop_2", investmentAmount: 65000000, investmentDate: "2023-01-18" },
    { investorId: "inv_2", propertyId: "prop_3", investmentAmount: 90000000, investmentDate: "2023-07-04" },
  ],
  updates: [
    { id: "upd_1", propertyId: "prop_3", title: "Urban water management systems enhanced", body: "Drainage channel checks confirmed stronger runoff control across the active FCDA work areas.", postedAt: "2026-06-22T12:00:00.000Z", authorId: "user_admin" },
    { id: "upd_2", propertyId: "prop_1", title: "Structural works continuing in Lifecamp", body: "The site team completed the latest quality review and confirmed progress against the construction programme.", postedAt: "2026-06-20T12:00:00.000Z", authorId: "user_staff" },
    { id: "upd_3", propertyId: "prop_2", title: "Foundation material delivery logged", body: "Blockwork and masonry supply has been received for the next foundation work package.", postedAt: "2026-06-18T12:00:00.000Z", authorId: "user_staff" },
  ],
  milestones: [
    { id: "mile_1", propertyId: "prop_1", title: "Structural Works", plannedDate: "2026-08-30", completedDate: null, status: "in_progress" },
    { id: "mile_2", propertyId: "prop_1", title: "Services Installation", plannedDate: "2026-10-15", completedDate: null, status: "pending" },
    { id: "mile_3", propertyId: "prop_2", title: "Foundation & Structure", plannedDate: "2026-09-15", completedDate: null, status: "in_progress" },
    { id: "mile_4", propertyId: "prop_3", title: "Final Inspection", plannedDate: "2026-08-20", completedDate: null, status: "in_progress" },
  ],
  materials: [
    { id: "mat_1", propertyId: "prop_1", materialName: "Steel Works Package", quantity: 30, unit: "tons", status: "delivered", updatedAt: "2026-06-18T09:00:00.000Z" },
    { id: "mat_2", propertyId: "prop_1", materialName: "Architectural Finishes", quantity: 240, unit: "sqm", status: "ordered", updatedAt: "2026-06-21T09:00:00.000Z" },
    { id: "mat_3", propertyId: "prop_2", materialName: "Foundation Materials", quantity: 1, unit: "lot", status: "delivered", updatedAt: "2026-06-17T09:00:00.000Z" },
    { id: "mat_4", propertyId: "prop_3", materialName: "Access Cover Package", quantity: 64, unit: "units", status: "installed", updatedAt: "2026-06-22T09:00:00.000Z" },
  ],
  documents: [
    { id: "doc_1", propertyId: "prop_1", investorId: null, title: "Progress Summary - Lifecamp Development", fileUrl: "/uploads/lifecamp-summary.pdf", uploadedAt: "2026-06-10T09:00:00.000Z", uploadedBy: "user_admin" },
    { id: "doc_2", propertyId: "prop_3", investorId: null, title: "Installation Completion Certificate", fileUrl: "/uploads/fcda-certificate.pdf", uploadedAt: "2026-06-12T09:00:00.000Z", uploadedBy: "user_staff" },
    { id: "doc_3", propertyId: null, investorId: "inv_1", title: "Investor Statement - Q2", fileUrl: "/uploads/investor-statement-q2.pdf", uploadedAt: "2026-06-15T09:00:00.000Z", uploadedBy: "user_admin" },
  ],
});

export const state = reactive(seedData());

const jsonClone = (value) => JSON.parse(JSON.stringify(value));

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

const replaceState = (payload) => {
  Object.assign(state, seedData(), payload || {});
};

export const loadAdminData = async () => {
  const payload = await request("/admin/data");
  replaceState(payload);
  return payload;
};

export const saveAdminData = async () => {
  const payload = await request("/admin/data", {
    method: "PUT",
    body: JSON.stringify(jsonClone(state)),
  });
  replaceState(payload);
  return payload;
};

export const loginStaff = async (credentials) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const adminDataReady = loadAdminData().catch((error) => {
  console.error("Failed to load admin data from backend:", error);
  return state;
});

const requireText = (value, label) => {
  if (!String(value || "").trim()) throw new Error(`${label} is required.`);
};

const touchProperty = (id) => {
  const property = state.properties.find((item) => item.id === id);
  if (property) property.updatedAt = nowIso();
};

export const store = {
  state,
  currentUser: computed(() => state.users[0]),
  propertyById: (id) => state.properties.find((item) => item.id === id),
  investorById: (id) => state.investors.find((item) => item.id === id),
  updatesForProperty: (id) => state.updates.filter((item) => item.propertyId === id).sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
  milestonesForProperty: (id) => state.milestones.filter((item) => item.propertyId === id),
  materialsForProperty: (id) => state.materials.filter((item) => item.propertyId === id),
  documentsForProperty: (id) => state.documents.filter((item) => item.propertyId === id),
  documentsForInvestor: (id) => state.documents.filter((item) => item.investorId === id),
  assignmentsForInvestor: (id) => state.investorProperties.filter((item) => item.investorId === id),

  async createProperty(payload) {
    requireText(payload.title, "Title");
    requireText(payload.location, "Location");
    const record = {
      id: uid("prop"),
      title: payload.title.trim(),
      location: payload.location.trim(),
      category: payload.category || "Real Estate Development",
      status: payload.status || "Under Construction",
      progressPercent: Number(payload.progressPercent || 0),
      estCompletionDate: payload.estCompletionDate || today(),
      coverImageUrl: payload.coverImageUrl || "/assets/home.png",
      description: payload.description || "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.properties.unshift(record);
    await saveAdminData();
    return record;
  },

  async updateProperty(id, payload) {
    const property = this.propertyById(id);
    if (!property) throw new Error("Property not found.");
    requireText(payload.title, "Title");
    requireText(payload.location, "Location");
    Object.assign(property, payload, {
      progressPercent: Math.max(0, Math.min(100, Number(payload.progressPercent || 0))),
      updatedAt: nowIso(),
    });
    await saveAdminData();
  },

  async upsertUpdate(payload) {
    requireText(payload.title, "Update title");
    requireText(payload.body, "Update body");
    if (payload.id) Object.assign(state.updates.find((item) => item.id === payload.id), payload);
    else state.updates.unshift({ ...payload, id: uid("upd"), postedAt: nowIso(), authorId: state.users[0].id });
    touchProperty(payload.propertyId);
    await saveAdminData();
  },

  async deleteUpdate(id) {
    state.updates.splice(state.updates.findIndex((item) => item.id === id), 1);
    await saveAdminData();
  },

  async upsertMilestone(payload) {
    requireText(payload.title, "Milestone title");
    const record = { ...payload, completedDate: payload.status === "done" ? payload.completedDate || today() : payload.completedDate || null };
    if (payload.id) Object.assign(state.milestones.find((item) => item.id === payload.id), record);
    else state.milestones.push({ ...record, id: uid("mile") });
    touchProperty(payload.propertyId);
    await saveAdminData();
  },

  async upsertMaterial(payload) {
    requireText(payload.materialName, "Material");
    const record = { ...payload, quantity: Number(payload.quantity || 0), updatedAt: nowIso() };
    if (payload.id) Object.assign(state.materials.find((item) => item.id === payload.id), record);
    else state.materials.push({ ...record, id: uid("mat") });
    touchProperty(payload.propertyId);
    await saveAdminData();
  },

  async addDocument(payload) {
    requireText(payload.title, "Document title");
    requireText(payload.fileUrl, "File URL");
    state.documents.unshift({ ...payload, id: uid("doc"), uploadedAt: nowIso(), uploadedBy: state.users[0].id });
    if (payload.propertyId) touchProperty(payload.propertyId);
    await saveAdminData();
  },

  async deleteDocument(id) {
    state.documents.splice(state.documents.findIndex((item) => item.id === id), 1);
    await saveAdminData();
  },

  async upsertInvestor(payload) {
    requireText(payload.name, "Investor name");
    requireText(payload.email, "Investor email");
    if (payload.id) Object.assign(state.investors.find((item) => item.id === payload.id), payload);
    else state.investors.unshift({ ...payload, id: uid("inv"), memberSince: payload.memberSince || today(), status: payload.status || "active" });
    await saveAdminData();
  },

  async setInvestorProperty(investorId, propertyId, assigned) {
    const index = state.investorProperties.findIndex((item) => item.investorId === investorId && item.propertyId === propertyId);
    if (assigned && index === -1) state.investorProperties.push({ investorId, propertyId, investmentAmount: null, investmentDate: today() });
    if (!assigned && index >= 0) state.investorProperties.splice(index, 1);
    await saveAdminData();
  },

  async upsertUser(payload) {
    requireText(payload.name, "Name");
    requireText(payload.email, "Email");
    if (!payload.id && !String(payload.password || "").trim()) throw new Error("Password is required.");
    if (payload.id) {
      const user = state.users.find((item) => item.id === payload.id);
      const next = { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
      if (String(payload.password || "").trim()) next.passwordHash = payload.password;
      Object.assign(user, next);
    } else {
      state.users.push({ id: uid("user"), name: payload.name, email: payload.email, role: payload.role, passwordHash: payload.password, createdAt: nowIso() });
    }
    await saveAdminData();
  },
};
