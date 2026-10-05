"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  image: string;
  badge: string;
  tone: string;
  slug: string;
  sizes?: string[];
  colors?: string[];
  discountPercentage?: number;
};

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const colorOptions = ["#f3e6dc", "#d9dfe8", "#111827", "#f7f7f4", "#c7b299", "#b9c9b7"];

const emptyForm = {
  id: "",
  name: "",
  category: "women" as Product["category"],
  price: "",
  image: "",
  badge: "In stock",
  tone: "#d9b0a8",
  slug: "",
  sizes: ["S", "M", "L"],
  colors: ["#d9b0a8", "#d9dfe8", "#111827"],
  discountPercentage: 0,
};

const emptyLandingForm = {
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

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [landingForm, setLandingForm] = useState(emptyLandingForm);
  const [landingLoading, setLandingLoading] = useState(false);
  const [landingImageUploading, setLandingImageUploading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = JSON.parse(localStorage.getItem("gleaz-user") || "null");
    if (!storedUser || storedUser.role !== "admin") {
      toast.error("Admin access required.");
      router.replace("/signin");
      return;
    }
  }, [router]);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to load products.");
      setProducts(result.products || []);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load products.");
    }
  };

  const loadLandingSettings = async () => {
    try {
      const response = await fetch("/api/admin/landing");
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to load landing page settings.");
      setLandingForm({ ...emptyLandingForm, ...result.landing });
    } catch (error: any) {
      toast.error(error?.message || "Unable to load landing page settings.");
    }
  };

  useEffect(() => {
    loadProducts();
    loadLandingSettings();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to upload image.");

      setForm((current) => ({ ...current, image: result.url }));
      toast.success("Image uploaded successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleLandingImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLandingImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to upload landing page image.");

      setLandingForm((current) => ({ ...current, heroImage: result.url }));
      toast.success("Landing page image uploaded successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to upload landing page image.");
    } finally {
      setLandingImageUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: Product = {
        ...form,
        id: form.id || crypto.randomUUID(),
        slug: form.slug || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sizes: Array.isArray(form.sizes) ? form.sizes.filter(Boolean) : [],
        colors: Array.isArray(form.colors) && form.colors.length ? form.colors.filter(Boolean) : [form.tone],
        tone: Array.isArray(form.colors) && form.colors.length ? form.colors[0] : form.tone,
        discountPercentage: Number(form.discountPercentage) > 0 ? Math.min(Number(form.discountPercentage), 100) : 0,
      };

      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save product.");

      toast.success(result?.message || "Product saved successfully.");
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (error: any) {
      toast.error(error?.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      ...emptyForm,
      ...product,
      sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["S", "M", "L"],
      colors: Array.isArray(product.colors) && product.colors.length ? product.colors : [product.tone || "#d9b0a8"],
      tone: product.tone || "#d9b0a8",
      discountPercentage: Number(product.discountPercentage) || 0,
    });
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to delete product.");

      toast.success(result?.message || "Product deleted successfully.");
      await loadProducts();
      if (editingId === productId) {
        setForm(emptyForm);
        setEditingId(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Unable to delete product.");
    }
  };

  const handleLandingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLandingLoading(true);

    try {
      const response = await fetch("/api/admin/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landingForm),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save landing page settings.");

      toast.success(result?.message || "Landing page updated successfully.");
      setLandingForm({ ...emptyLandingForm, ...result.landing });
    } catch (error: any) {
      toast.error(error?.message || "Unable to save landing page settings.");
    } finally {
      setLandingLoading(false);
    }
  };

  const productCount = useMemo(() => products.length, [products]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7a7a7a]">Admin</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#111111]">
            Product manager
          </h1>
        </div>
        <div>
          <div className="rounded-full border border-[#d9d7d2] bg-[#f7f6f4] px-4 py-2 text-sm text-[#111111]">{productCount} products</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-[16px] border border-[#e7e3df] bg-white p-6 shadow-sm">
          <div className="mb-6 text-xl font-semibold text-[#111111]">
            {editingId ? "Update product" : "Add new product"}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Product name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="e.g. Satin Evening Dress"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Price</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="Rs 4,500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Product image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-md border border-[#d7d4cf] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none file:mr-3 file:rounded file:border-0 file:bg-[#111111] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white focus:border-[#111111]"
                required={!form.image}
              />
              {uploading && <p className="mt-2 text-xs text-[#6a6a6a]">Uploading image...</p>}
              {form.image && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[#e7e3df] bg-[#f7f6f4]">
                  <img src={form.image} alt="Product preview" className="h-36 w-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Badge</label>
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="In stock"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Discount percentage</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPercentage ?? 0}
                onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Available sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const selected = Array.isArray(form.sizes) && form.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const currentSizes = Array.isArray(form.sizes) ? form.sizes : [];
                        const nextSizes = selected
                          ? currentSizes.filter((item) => item !== size)
                          : [...currentSizes, size];
                        setForm({ ...form, sizes: nextSizes });
                      }}
                      className={`rounded border px-3 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#d7d4cf] bg-white text-[#111111]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="product-slug"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111111]">Available colors</label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => {
                  const selected = Array.isArray(form.colors) && form.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        const currentColors = Array.isArray(form.colors) ? form.colors : [];
                        const nextColors = selected
                          ? currentColors.filter((item) => item !== color)
                          : [...currentColors, color];
                        const finalColors = nextColors.length ? nextColors : [color];
                        setForm({
                          ...form,
                          colors: finalColors,
                          tone: finalColors[0],
                        });
                      }}
                      className={`h-11 w-11 rounded-md border-2 transition ${
                        selected ? "border-[#111111] ring-2 ring-[#111111]/20" : "border-[#d7d4cf]"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded bg-[#111111] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Insert"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                }}
                className="rounded border border-[#d7d4cf] px-4 py-3 text-sm font-medium text-[#111111]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <form onSubmit={handleLandingSubmit} className="rounded-[16px] border border-[#e7e3df] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7a7a7a]">Landing page</p>
                <h2 className="mt-2 text-2xl font-bold text-[#111111]">Hero and content</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#111111]">Hero title</label>
                <input
                  value={landingForm.heroTitle}
                  onChange={(e) => setLandingForm({ ...landingForm, heroTitle: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="The Cotton"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">Hero subtitle</label>
                <input
                  value={landingForm.heroSubtitle}
                  onChange={(e) => setLandingForm({ ...landingForm, heroSubtitle: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="MUSE"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">Hero badge</label>
                <input
                  value={landingForm.heroBadge}
                  onChange={(e) => setLandingForm({ ...landingForm, heroBadge: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="New Edit"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#111111]">Hero image</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLandingImageUpload}
                    className="w-full rounded-md border border-[#d7d4cf] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none file:mr-3 file:rounded file:border-0 file:bg-[#111111] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white focus:border-[#111111]"
                  />
                  {landingImageUploading && <p className="text-xs text-[#6a6a6a]">Uploading hero image...</p>}
                  {landingForm.heroImage && (
                    <div className="overflow-hidden rounded-lg border border-[#e7e3df] bg-[#f7f6f4]">
                      <img src={landingForm.heroImage} alt="Landing hero preview" className="h-40 w-full object-cover" />
                    </div>
                  )}
                  <input
                    value={landingForm.heroImage}
                    onChange={(e) => setLandingForm({ ...landingForm, heroImage: e.target.value })}
                    className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                    placeholder="or paste image URL"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">CTA text</label>
                <input
                  value={landingForm.ctaText}
                  onChange={(e) => setLandingForm({ ...landingForm, ctaText: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="Shop now"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">CTA link</label>
                <input
                  value={landingForm.ctaLink}
                  onChange={(e) => setLandingForm({ ...landingForm, ctaLink: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="/shop-with-sidebar?category=women"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">Women section title</label>
                <input
                  value={landingForm.womenSectionTitle}
                  onChange={(e) => setLandingForm({ ...landingForm, womenSectionTitle: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="Women"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111111]">Men section title</label>
                <input
                  value={landingForm.menSectionTitle}
                  onChange={(e) => setLandingForm({ ...landingForm, menSectionTitle: e.target.value })}
                  className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                  placeholder="Men"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={landingLoading}
              className="mt-6 inline-flex w-full items-center justify-center rounded bg-[#111111] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {landingLoading ? "Saving..." : "Save landing page"}
            </button>
          </form>

          {products.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
              No products available.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex gap-4 rounded-[16px] border border-[#e7e3df] bg-white p-4 shadow-sm">
                <div className="h-28 w-28 overflow-hidden rounded-lg border border-[#efeae4] bg-[#f7f6f4]" style={{ backgroundColor: product.tone }}>
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-[#111111]">{product.name}</div>
                    <div className="mt-1 text-sm uppercase tracking-[0.12em] text-[#6a6a6a]">{product.category}</div>
                    <div className="mt-2 text-base font-bold text-[#111111]">{product.price}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded border border-[#d7d4cf] px-3 py-2 text-sm font-medium text-[#111111]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded bg-[#111111] px-3 py-2 text-sm font-medium text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
