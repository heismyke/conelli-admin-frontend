import { computed, reactive } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000");
const authKey = "conelli_admin_auth";

const readStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(authKey) || "null");
  } catch {
    return null;
  }
};


const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const publicProjectFields = {
  prop_3: {
    publicDescription: "Comprehensive drainage infrastructure and manhole cover installation project for the Federal Capital Development Authority, enhancing urban water management systems.",
    publicOverview: "This large-scale infrastructure project involved the design, installation, and implementation of a comprehensive drainage system for the Federal Capital Development Authority. The project included the installation of modern manhole covers, drainage channels, and water management systems to improve urban flood control and water runoff management across multiple districts.",
    client: "Federal Capital Development Authority",
    year: "2023",
    tags: ["Infrastructure", "Drainage", "FCDA"],
    galleryImages: ["/assets/drainage-manhole-cover-fcda/manhole1.jpg", "/assets/drainage-manhole-cover-fcda/manhole2.jpg", "/assets/drainage-manhole-cover-fcda/manhole3.jpg", "/assets/drainage-manhole-cover-fcda/manhole4.jpg", "/assets/drainage-manhole-cover-fcda/manhole5.jpg", "/assets/drainage-manhole-cover-fcda/manhole6.jpg", "/assets/drainage-manhole-cover-fcda/manhole7.jpg", "/assets/drainage-manhole-cover-fcda/manhole8.jpg", "/assets/drainage-manhole-cover-fcda/manhole9.jpg"],
  },
  prop_1: {
    publicDescription: "Premium real estate development project in Lifecamp, Abuja, featuring modern residential and commercial properties designed for contemporary urban living.",
    publicOverview: "A residential development project in the prestigious Lifecamp area, featuring luxury residential units. The project incorporates sustainable design principles, modern amenities, and quality construction standards.",
    client: "Private Developer",
    year: "2023",
    tags: ["Real Estate", "Development", "Lifecamp"],
    galleryImages: ["/assets/real-estate-lifecamp/lifecamp1.png", "/assets/real-estate-lifecamp/lifecamp2.png", "/assets/real-estate-lifecamp/lifecamp3.png", "/assets/real-estate-lifecamp/lifecamp4.png", "/assets/real-estate-lifecamp/lifecamp5.png", "/assets/real-estate-lifecamp/lifecamp6.jpg"],
  },
  prop_2: {
    publicDescription: "Modern residential development project in Durumi, Abuja, featuring contemporary design and quality construction for comfortable urban living.",
    publicOverview: "A premium residential development featuring modern architectural design, sustainable building practices, and high-quality finishes. The project includes multiple residential units with contemporary amenities designed for comfortable urban living.",
    client: "Private Developer",
    year: "2023",
    tags: ["Real Estate", "Residential", "Development"],
    galleryImages: ["/assets/residential-durumi/durumi1.jpg", "/assets/residential-durumi/durumi2.jpg", "/assets/residential-durumi/durumi8.jpg", "/assets/residential-durumi/durumi9.jpg"],
  },
};

const seedData = () => ({
  users: [
    { id: "user_admin", name: "Ada Okafor", email: "admin@conelliengineering.com", passwordHash: "dev", role: "ADMIN", profileImageUrl: "", createdAt: "2026-01-08T09:00:00.000Z" },
    { id: "user_staff", name: "Site Office", email: "staff@conelliengineering.com", passwordHash: "dev", role: "STAFF", profileImageUrl: "", createdAt: "2026-01-10T09:00:00.000Z" },
  ],
  investors: [
    { id: "inv_1", name: "Conelli Partner", email: "partner@conelliengineering.com", phone: "+234 800 000 1001", memberSince: "2022-03-01", status: "active", passwordHash: "dev" },
    { id: "inv_2", name: "Infrastructure Holdings Ltd", email: "ops@infrastructureholdings.ng", phone: "+234 800 000 1002", memberSince: "2023-06-15", status: "active", passwordHash: "dev" },
  ],
  properties: [
    {
      id: "prop_1",
      ...publicProjectFields.prop_1,
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
      ...publicProjectFields.prop_2,
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
      ...publicProjectFields.prop_3,
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
    { id: "upd_3", propertyId: "prop_2", title: "Foundation progress logged", body: "The site team has recorded progress on the next foundation work package.", postedAt: "2026-06-18T12:00:00.000Z", authorId: "user_staff" },
  ],
  milestones: [
    { id: "mile_1", propertyId: "prop_1", title: "Structural Works", plannedDate: "2026-08-30", completedDate: null, status: "in_progress" },
    { id: "mile_2", propertyId: "prop_1", title: "Services Installation", plannedDate: "2026-10-15", completedDate: null, status: "pending" },
    { id: "mile_3", propertyId: "prop_2", title: "Foundation & Structure", plannedDate: "2026-09-15", completedDate: null, status: "in_progress" },
    { id: "mile_4", propertyId: "prop_3", title: "Final Inspection", plannedDate: "2026-08-20", completedDate: null, status: "in_progress" },
  ],
  documents: [
    { id: "doc_1", propertyId: "prop_1", investorId: null, title: "Progress Summary - Lifecamp Development", fileUrl: "/uploads/lifecamp-summary.pdf", uploadedAt: "2026-06-10T09:00:00.000Z", uploadedBy: "user_admin" },
    { id: "doc_2", propertyId: "prop_3", investorId: null, title: "Installation Completion Certificate", fileUrl: "/uploads/fcda-certificate.pdf", uploadedAt: "2026-06-12T09:00:00.000Z", uploadedBy: "user_staff" },
    { id: "doc_3", propertyId: null, investorId: "inv_1", title: "Investor Statement - Q2", fileUrl: "/uploads/investor-statement-q2.pdf", uploadedAt: "2026-06-15T09:00:00.000Z", uploadedBy: "user_admin" },
  ],
});

export const state = reactive(seedData());
export const authState = reactive({ user: readStoredAuth() });
export const setCurrentUser = (user) => {
  authState.user = user || null;
  if (authState.user) localStorage.setItem(authKey, JSON.stringify(authState.user));
};
export const clearCurrentUser = () => {
  authState.user = null;
  localStorage.removeItem(authKey);
};
export const isAdmin = computed(() => String(authState.user?.role || "").toUpperCase() === "ADMIN");

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
  const { materials, ...nextPayload } = payload || {};
  Object.assign(state, seedData(), nextPayload);
  delete state.materials;
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

export const uploadAdminFile = async (file, folder = "admin") => {
  const presign = await request("/admin/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    }),
  });

  const response = await fetch(presign.uploadUrl, {
    method: presign.method || "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return presign.fileUrl;
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
  currentUser: computed(() => {
    const authUser = authState.user;
    if (!authUser) return state.users[0];
    return state.users.find((user) => user.id === authUser.id || user.email === authUser.email) || authUser;
  }),
  propertyById: (id) => state.properties.find((item) => item.id === id),
  investorById: (id) => state.investors.find((item) => item.id === id),
  updatesForProperty: (id) => state.updates.filter((item) => item.propertyId === id).sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
  milestonesForProperty: (id) => state.milestones.filter((item) => item.propertyId === id),
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
      publicDescription: payload.publicDescription || payload.description || "",
      publicOverview: payload.publicOverview || payload.description || "",
      client: payload.client || "",
      year: payload.year || new Date().getFullYear().toString(),
      tags: Array.isArray(payload.tags) ? payload.tags : String(payload.tags || payload.category || "").split(",").map((item) => item.trim()).filter(Boolean),
      galleryImages: Array.isArray(payload.galleryImages) ? payload.galleryImages : String(payload.galleryImages || payload.coverImageUrl || "").split("\n").map((item) => item.trim()).filter(Boolean),
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
      tags: Array.isArray(payload.tags) ? payload.tags : String(payload.tags || "").split(",").map((item) => item.trim()).filter(Boolean),
      galleryImages: Array.isArray(payload.galleryImages) ? payload.galleryImages : String(payload.galleryImages || "").split("\n").map((item) => item.trim()).filter(Boolean),
      updatedAt: nowIso(),
    });
    await saveAdminData();
  },

  async deleteProperty(id) {
    const index = state.properties.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Property not found.");
    state.properties.splice(index, 1);
    state.investorProperties = state.investorProperties.filter((item) => item.propertyId !== id);
    state.updates = state.updates.filter((item) => item.propertyId !== id);
    state.milestones = state.milestones.filter((item) => item.propertyId !== id);
    state.documents = state.documents.filter((item) => item.propertyId !== id);
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

  async deleteMilestone(id) {
    const index = state.milestones.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Milestone not found.");
    const propertyId = state.milestones[index].propertyId;
    state.milestones.splice(index, 1);
    touchProperty(propertyId);
    await saveAdminData();
  },

  async upsertDocument(payload) {
    requireText(payload.title, "Document title");
    requireText(payload.fileUrl, "File URL");
    if (payload.id) {
      const document = state.documents.find((item) => item.id === payload.id);
      if (!document) throw new Error("Document not found.");
      Object.assign(document, payload);
    } else {
      state.documents.unshift({ ...payload, id: uid("doc"), uploadedAt: nowIso(), uploadedBy: state.users[0].id });
    }
    if (payload.propertyId) touchProperty(payload.propertyId);
    await saveAdminData();
  },

  async addDocument(payload) {
    return this.upsertDocument(payload);
  },

  async deleteDocument(id) {
    state.documents.splice(state.documents.findIndex((item) => item.id === id), 1);
    await saveAdminData();
  },

  async upsertInvestor(payload) {
    requireText(payload.name, "Investor name");
    requireText(payload.email, "Investor email");
    if (!payload.id && !String(payload.password || "").trim()) throw new Error("Password is required.");
    const next = {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone || "",
      memberSince: payload.memberSince || today(),
      status: payload.status || "active",
    };
    if (String(payload.password || "").trim()) next.passwordHash = payload.password;
    if (payload.id) {
      const investor = state.investors.find((item) => item.id === payload.id);
      if (!investor) throw new Error("Investor not found.");
      Object.assign(investor, { id: payload.id, ...next });
      await saveAdminData();
      return investor;
    }
    const record = { id: uid("inv"), ...next };
    state.investors.unshift(record);
    await saveAdminData();
    return record;
  },

  async deleteInvestor(id) {
    const index = state.investors.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Investor not found.");
    state.investors.splice(index, 1);
    state.investorProperties = state.investorProperties.filter((item) => item.investorId !== id);
    state.documents = state.documents.filter((item) => item.investorId !== id);
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
      if (!user) throw new Error("User not found.");
      const next = { id: payload.id, name: payload.name, email: payload.email, role: payload.role, profileImageUrl: payload.profileImageUrl || "" };
      if (String(payload.password || "").trim()) next.passwordHash = payload.password;
      Object.assign(user, next);
    } else {
      state.users.push({ id: uid("user"), name: payload.name, email: payload.email, role: payload.role, profileImageUrl: payload.profileImageUrl || "", passwordHash: payload.password, createdAt: nowIso() });
    }
    await saveAdminData();
  },

  async deleteUser(id) {
    const index = state.users.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("User not found.");
    const user = state.users[index];
    const adminCount = state.users.filter((item) => item.role === "ADMIN").length;
    if (user.role === "ADMIN" && adminCount <= 1) throw new Error("At least one admin user is required.");
    state.users.splice(index, 1);
    for (const update of state.updates) {
      if (update.authorId === id) update.authorId = null;
    }
    for (const document of state.documents) {
      if (document.uploadedBy === id) document.uploadedBy = null;
    }
    await saveAdminData();
  },
};
