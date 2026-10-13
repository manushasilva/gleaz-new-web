import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import type { ProductColorVariant } from "@/types/product";

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

export type StoreSession = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type StoreProduct = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  image: string;
  images?: string[];
  badge: string;
  tone: string;
  slug: string;
  quantity?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  colorVariants?: ProductColorVariant[];
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreVoucher = {
  id: string;
  name: string;
  description: string;
  amount: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type StoreOrder = {
  id: string;
  status?: "pending" | "confirmed" | "cancelled";
  statusUpdatedAt?: string;
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

export type FooterSettings = {
  address?: string;
  phone?: string;
  email?: string;
  copyright?: string;
};

export type StoreData = {
  users: StoreUser[];
  sessions: StoreSession[];
  products: StoreProduct[];
  vouchers: StoreVoucher[];
  orders: StoreOrder[];
  landing: LandingSettings;
  footer?: FooterSettings;
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
const STORE_ROW_ID = "main";

function getSupabaseStoreClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl && !supabaseKey) return null;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase store needs both SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
  sessions: [],
  products: defaultProducts,
  vouchers: [],
  orders: [],
  landing: defaultLandingSettings,
  footer: {
    address: "685 Market Street,Las Vegas, LA 95820,United States.",
    phone: "+(099) 532-786-9843",
    email: "gleaz.fashion@gmail.com",
    copyright: `© ${new Date().getFullYear()}. All rights reserved.`,
  },
};

const inMemoryStore: { current?: StoreData } = {};

function normalizeStore(parsed: Partial<StoreData> | null | undefined): StoreData {
  return {
    users: Array.isArray(parsed?.users) ? parsed.users : [],
    sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    // Preserve an explicit empty products array so deleted products stay deleted.
    products: Array.isArray(parsed?.products) ? parsed.products : defaultProducts,
    vouchers: Array.isArray(parsed?.vouchers) ? parsed.vouchers : [],
    orders: Array.isArray(parsed?.orders) ? parsed.orders : [],
    landing: {
      ...defaultLandingSettings,
      ...(parsed?.landing && typeof parsed.landing === "object" ? parsed.landing : {}),
    },
    footer: {
      ...(parsed?.footer && typeof parsed.footer === "object" ? parsed.footer : {}),
    },
  };
}

function isReadOnlyFileSystemError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "EROFS" || error.code === "EPERM" || error.code === "EACCES")
  );
}

async function ensureStore() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    }
  } catch (error) {
    if (isReadOnlyFileSystemError(error)) {
      inMemoryStore.current ??= defaultData;
      return;
    }

    throw error;
  }
}

export async function readStore(): Promise<StoreData> {
  const supabase = getSupabaseStoreClient();

  if (supabase) {
    const { data: row, error } = await supabase
      .from("app_store")
      .select("data")
      .eq("id", STORE_ROW_ID)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to read the Supabase app_store table: ${error.message}`);
    }

    if (row?.data && typeof row.data === "object") {
      const store = normalizeStore(row.data as Partial<StoreData>);
      inMemoryStore.current = store;
      return store;
    }

    // Migrate the committed/local JSON data once when the Supabase row is first created.
    let initialStore = defaultData;
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      initialStore = normalizeStore(JSON.parse(raw) as Partial<StoreData>);
    } catch {
      // A fresh Vercel deployment may not contain a readable local data file.
    }

    const { error: seedError } = await supabase.from("app_store").upsert({
      id: STORE_ROW_ID,
      data: initialStore,
      updated_at: new Date().toISOString(),
    });

    if (seedError) {
      throw new Error(`Unable to initialize the Supabase app_store table: ${seedError.message}`);
    }

    inMemoryStore.current = initialStore;
    return initialStore;
  }

  try {
    await ensureStore();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const store = normalizeStore(parsed);

    inMemoryStore.current = store;
    return store;
  } catch (error) {
    if (isReadOnlyFileSystemError(error)) {
      inMemoryStore.current ??= defaultData;
      return inMemoryStore.current;
    }

    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    } catch {
      inMemoryStore.current ??= defaultData;
    }

    return defaultData;
  }
}

export async function writeStore(data: StoreData) {
  inMemoryStore.current = data;
  const supabase = getSupabaseStoreClient();

  if (supabase) {
    const { error } = await supabase.from("app_store").upsert({
      id: STORE_ROW_ID,
      data,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Unable to save the Supabase app_store table: ${error.message}`);
    }
    return;
  }

  try {
    await ensureStore();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    if (!isReadOnlyFileSystemError(error)) {
      throw error;
    }
  }
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

export async function getVouchers() {
  const store = await readStore();
  return store.vouchers;
}

export async function saveVouchers(vouchers: StoreVoucher[]) {
  const store = await readStore();
  await writeStore({ ...store, vouchers });
  return vouchers;
}

export async function getLandingSettings() {
  const store = await readStore();
  return {
    ...defaultLandingSettings,
    ...(store.landing || {}),
  };
}

export async function getFooterSettings() {
  const store = await readStore();
  return {
    ...(store.footer || {}),
  };
}

export async function saveFooterSettings(settings: Partial<FooterSettings>) {
  const store = await readStore();
  const nextFooter = {
    ...(store.footer || {}),
    ...settings,
  };

  await writeStore({ ...store, footer: nextFooter });
  return nextFooter;
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
  const store = await readStore();

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

  }

  await writeStore(store);
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

export async function createUserSession(userId: string) {
  const store = await readStore();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  const session = {
    token: crypto.randomUUID(),
    userId,
    expiresAt,
  };

  store.sessions = store.sessions.filter((item) => new Date(item.expiresAt).getTime() > Date.now());
  store.sessions.push(session);
  await writeStore(store);
  return session;
}

export async function getUserForSession(token: string) {
  const store = await readStore();
  const session = store.sessions.find(
    (item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now()
  );

  return session ? store.users.find((user) => user.id === session.userId) ?? null : null;
}

export async function deleteUserSession(token: string) {
  const store = await readStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
  await writeStore(store);
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
  const products = store.products.map((product) => ({
    ...product,
    colorVariants: product.colorVariants?.map((variant) => ({
      ...variant,
      sizeVariants: variant.sizeVariants?.map((sizeVariant) => ({ ...sizeVariant })),
    })),
  }));
  const items = order.items.map((item) => {
    if (item.itemType === "gift-voucher") return item;

    const productId = String(item.productId || "");
    if (!productId && !item.slug) return item;

    const product = products.find(
      (candidate) =>
        (productId && candidate.id === productId) ||
        (item.slug && candidate.slug === String(item.slug))
    );
    if (!product) {
      if (!productId) return item;
      throw new OrderValidationError("A product in your cart is no longer available. Please refresh your cart.");
    }

    const colorVariant = product.colorVariants?.find(
      (variant) =>
        variant.color === String(item.variantColor || "") ||
        variant.name === String(item.color || "")
    );
    if (!colorVariant?.sizeVariants?.length) return item;

    const sizeVariant = colorVariant.sizeVariants.find(
      (variant) => variant.size === String(item.size || "")
    );
    const requestedQuantity = Number(item.quantity);
    if (!sizeVariant || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      throw new OrderValidationError("Choose an available product size and color.");
    }
    if (sizeVariant.quantity < requestedQuantity) {
      throw new OrderValidationError(
        `Only ${sizeVariant.quantity} item(s) remain in ${colorVariant.name}, size ${sizeVariant.size}.`
      );
    }

    const basePrice = Number(sizeVariant.price.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      throw new Error(`Invalid price for ${product.name}, size ${sizeVariant.size}.`);
    }

    sizeVariant.quantity -= requestedQuantity;
    product.updatedAt = new Date().toISOString();
    const discountRate = Math.min(Math.max(Number(product.discountPercentage) || 0, 0), 100) / 100;
    return { ...item, price: Math.round(basePrice * (1 - discountRate)) };
  });
  const orderTotal = items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const savedOrder = {
    ...order,
    items,
    orderTotal,
    status: order.status || "pending",
  };
  store.products = products;
  store.orders.unshift(savedOrder);
  await writeStore(store);
  return savedOrder;
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: NonNullable<StoreOrder["status"]>
) {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === orderId);

  if (!order) return null;

  order.status = status;
  order.statusUpdatedAt = new Date().toISOString();
  await writeStore(store);
  return order;
}
