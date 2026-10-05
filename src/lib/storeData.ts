import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";

export type StoreUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  role: "admin" | "user";
  createdAt: string;
};

export type StoreProduct = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  image: string;
  badge: string;
  tone: string;
  slug: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreOrder = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  items: any[];
  orderTotal: number;
  createdAt: string;
};

export type LandingSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroBadge: string;
  ctaText: string;
  ctaLink: string;
  womenSectionTitle: string;
  menSectionTitle: string;
};

export type StoreData = {
  users: StoreUser[];
  products: StoreProduct[];
  orders: StoreOrder[];
  landing: LandingSettings;
};

const defaultProducts: StoreProduct[] = [
  {
    id: "p1",
    name: "Aster Printed Dress",
    category: "women",
    price: "Rs 6,993",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    badge: "In stock",
    tone: "#d9b0a8",
    slug: "aster-printed-dress",
    description: "Elegant drape with premium finish.",
    colors: ["#d9b0a8", "#dfe3ea", "#111827"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Mira Printed Dress",
    category: "women",
    price: "Rs 6,500",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    badge: "-30%",
    tone: "#d7d9d2",
    slug: "mira-printed-dress",
    description: "Flowing fit with modern tailoring.",
    colors: ["#d7d9d2", "#b9c9b7", "#d2b48c"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Milan Utility Shirt",
    category: "men",
    price: "Rs 4,750",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    badge: "In stock",
    tone: "#dfe3ea",
    slug: "milan-utility-shirt",
    description: "Structured and comfortable for everyday wear.",
    colors: ["#dfe3ea", "#111827", "#c7b299"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "p4",
    name: "Hawke Cotton Overshirt",
    category: "men",
    price: "Rs 6,280",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    badge: "-30%",
    tone: "#e7e3d9",
    slug: "hawke-cotton-overshirt",
    description: "Clean finish and relaxed layering style.",
    colors: ["#e7e3d9", "#b9c9b7", "#f3e6dc"],
    createdAt: new Date().toISOString(),
  },
];

const DATA_FILE = path.join(process.cwd(), "data", "store.json");

const defaultLandingSettings: LandingSettings = {
  heroTitle: "The Cotton",
  heroSubtitle: "MUSE",
  heroImage:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  heroBadge: "New Edit",
  ctaText: "Shop now",
  ctaLink: "/shop-with-sidebar?category=women",
  womenSectionTitle: "Women",
  menSectionTitle: "Men",
};

const defaultData: StoreData = {
  users: [],
  products: defaultProducts,
  orders: [],
  landing: defaultLandingSettings,
};

async function ensureStore() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreData> {
  await ensureStore();

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      // IMPORTANT: respect an explicit empty products array in store.json.
      // Previously this fell back to demo `defaultProducts` when products was empty,
      // which caused deleted products to reappear on the landing page. Return
      // the parsed products array (even if empty) when present.
      products: Array.isArray(parsed.products) ? parsed.products : defaultProducts,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      landing: {
        ...defaultLandingSettings,
        ...(parsed.landing && typeof parsed.landing === "object" ? parsed.landing : {}),
      },
    };
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
}

export async function writeStore(data: StoreData) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getProducts() {
  const store = await readStore();
  return store.products;
}

export async function saveProducts(products: StoreProduct[]) {
  const store = await readStore();
  const nextStore = { ...store, products };
  await writeStore(nextStore);
  return products;
}

export async function getLandingSettings() {
  const store = await readStore();
  return {
    ...defaultLandingSettings,
    ...(store.landing || {}),
  };
}

export async function saveLandingSettings(settings: Partial<LandingSettings>) {
  const store = await readStore();
  const nextLanding = {
    ...defaultLandingSettings,
    ...(store.landing || {}),
    ...settings,
  };

  await writeStore({ ...store, landing: nextLanding });
  return nextLanding;
}

export async function getUsers() {
  const store = await readStore();
  return store.users;
}

export async function ensureDefaultAdminUser() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  let existing: StoreData | null = null;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    existing = JSON.parse(raw) as Partial<StoreData>;
  } catch {
    existing = null;
  }

  const store: StoreData = {
    users: Array.isArray(existing?.users) ? existing.users : [],
    // Preserve an explicit empty products array; do not seed demo products automatically
    // when products is present but empty. This avoids re-adding demo items after an admin
    // deletes all products.
    products: Array.isArray(existing?.products) ? existing.products : defaultProducts,
    orders: Array.isArray(existing?.orders) ? existing?.orders : [],
    landing: {
      ...defaultLandingSettings,
      ...(existing?.landing && typeof existing.landing === "object" ? existing.landing : {}),
    },
  };

  const hasAdmin = store.users.some(
    (user) =>
      user.role === "admin" ||
      user.email.toLowerCase() === "admin@cozycommerce.com" ||
      user.username.toLowerCase() === "admin"
  );

  if (!hasAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 10);

    store.users.push({
      id: "admin-1",
      username: "admin",
      fullName: "Admin",
      email: "admin@cozycommerce.com",
      phone: "0000000000",
      address: "System",
      passwordHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    });

    await writeStore(store);
  }
}

export async function createUser(user: Omit<StoreUser, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
  const store = await readStore();
  const nextUser: StoreUser = {
    id: user.id ?? crypto.randomUUID(),
    username: user.username || user.email.split("@")[0] || "user",
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    passwordHash: user.passwordHash,
    role: user.role ?? "user",
    createdAt: user.createdAt ?? new Date().toISOString(),
  };

  store.users.push(nextUser);
  await writeStore(store);
  return nextUser;
}

export async function getUserByEmail(email: string) {
  const store = await readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUserById(id: string) {
  const store = await readStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function updateUserProfile(userId: string, changes: Partial<Omit<StoreUser, "id" | "createdAt" | "passwordHash">> & { email?: string; fullName?: string; phone?: string; address?: string; username?: string; }) {
  const store = await readStore();
  const index = store.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return null;
  }

  const existingUser = store.users[index];
  const nextUser = {
    ...existingUser,
    username: changes.username?.trim() || existingUser.username || existingUser.email.split("@")[0],
    fullName: changes.fullName?.trim() || existingUser.fullName,
    email: changes.email?.trim() || existingUser.email,
    phone: changes.phone?.trim() || existingUser.phone,
    address: changes.address?.trim() || existingUser.address,
  };

  store.users[index] = nextUser;
  await writeStore(store);
  return nextUser;
}

export async function getUserByIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase();
  const store = await readStore();

  return (
    store.users.find(
      (user) =>
        user.email.toLowerCase() === value ||
        user.username.toLowerCase() === value ||
        user.fullName.toLowerCase() === value
    ) ?? null
  );
}

export async function saveOrder(order: StoreOrder) {
  const store = await readStore();
  store.orders.unshift(order);
  await writeStore(store);
  return order;
}
