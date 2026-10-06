import Image from "next/image";
import Link from "next/link";
import { getLandingSettings, getProducts } from "@/lib/storeData";
import type { StoreProduct } from "@/lib/storeData";

const formatProductBadge = (badge?: string) => {
  const cleanBadge = (badge || "In stock").trim();
  if (!cleanBadge) return "IN STOCK";
  if (cleanBadge.startsWith("-")) return `${cleanBadge} OFF`;
  return cleanBadge.toUpperCase();
};

const formatLkrPrice = (rawValue: string | number) => {
  const numericValue = typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue)) return "LKR 0";
  return `LKR ${new Intl.NumberFormat("en-LK").format(numericValue)}`;
};

const ProductGrid = ({ title, products, category }: { title: string; products: StoreProduct[]; category?: "women" | "men" | "accessories" }) => (
  <section className="mx-auto max-w-[1600px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">Collection</p>
        <h2 className="mt-2 text-[2.4rem] font-light uppercase tracking-[-0.06em] text-[#111111]">{title}</h2>
      </div>

      {category && (
        <Link
          href={`/shop-with-sidebar?category=${category}`}
          className="inline-flex items-center gap-2 border border-[#d9d7d2] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
        >
          See more
        </Link>
      )}
    </div>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <Link key={`${category}-${product.id || product.slug}`} href={`/products/${product.slug}`} className="group block">
          <article>
            <div className="relative h-[420px] overflow-hidden rounded-[12px] bg-[#efefee]" style={{ backgroundColor: product.tone || "#efefee" }}>
              <div className="absolute left-4 top-4 z-10 flex h-10 items-center justify-center rounded-full bg-[#111111] px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white">
                {formatProductBadge(product.badge)}
              </div>
              {Number(product.discountPercentage) > 0 && (
                <div className="absolute right-4 top-4 z-10 flex h-10 items-center justify-center rounded-full bg-[#d94444] px-3 text-[0.7rem] font-bold text-white">
                  -{Math.min(Number(product.discountPercentage), 100)}%
                </div>
              )}
              <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={1000}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-[0.9rem] text-[#111111]">
              <div className="flex-1">
                <div className="text-[1.05rem] font-medium leading-snug">{product.name}</div>
                <div className="mt-2 flex items-center gap-2 text-[1.05rem]">
                  {Number(product.discountPercentage) > 0 ? (
                    <>
                      <span className="text-[#7a7a7a] line-through">{formatLkrPrice(product.price)}</span>
                      <span className="font-bold text-[#111111]">
                        {formatLkrPrice(
                          Number(String(product.price).replace(/[^\d.]/g, "")) * (1 - Number(product.discountPercentage) / 100)
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-[#111111]">{formatLkrPrice(product.price)}</span>
                  )}
                </div>
              </div>
              <div className="rounded-full border border-[#d7d5d2] px-2 py-1 text-[0.7rem] uppercase tracking-[0.12em] text-[#111111]">
                {(product.badge || "In stock").replace('-', '')}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  </section>
);

const Home = async () => {
  const landing = await getLandingSettings();
  const products = await getProducts();
  const womenProducts = products.filter((product) => product.category === "women").slice(0, 4);
  const menProducts = products.filter((product) => product.category === "men").slice(0, 4);
  const saleProducts = products
    .filter((product) => Number(product.discountPercentage) > 0)
    .sort((first, second) => Number(second.discountPercentage) - Number(first.discountPercentage))
    .slice(0, 4);
  const categories = [
    { name: "Women", slug: "women" as const, image: "/images/categories/categories-01.png", description: "Everyday pieces, made to feel special." },
    { name: "Men", slug: "men" as const, image: "/images/categories/categories-02.png", description: "Easy layers and modern essentials." },
    { name: "Accessories", slug: "accessories" as const, image: "/images/categories/categories-03.png", description: "The finishing touches to your look." },
  ];

  return (
    <main id="top" className="min-h-screen bg-[#f4f4f2] text-[#111111]">
      <section className="mx-auto mt-24 max-w-[1600px] overflow-hidden bg-[#f2f0ee] px-0 pb-12 pt-0">
        <div className="relative min-h-[700px] bg-[#f4f2ef]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: `url(${landing.heroImage})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.38)_24%,rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.22)_100%)]" />

          <div className="relative z-10 flex h-full min-h-[700px] items-center justify-start px-6 sm:px-10 lg:px-16">
            <div className="max-w-[520px] text-left text-white">
              {landing.heroBadge && (
                <div className="mb-5 inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  {landing.heroBadge}
                </div>
              )}
              <h1 className="font-[cursive] text-[4.5rem] leading-[0.9] tracking-[-0.06em] sm:text-[6rem]">
                {landing.heroTitle}
                <span className="mt-2 block text-[2.4rem] tracking-[0.12em] sm:text-[3.2rem]">{landing.heroSubtitle}</span>
              </h1>
              <Link
                href={landing.ctaLink}
                className="mt-8 inline-flex border border-white/80 bg-transparent px-8 py-4 text-base font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#111111]"
              >
                {landing.ctaText}
              </Link>
            </div>
          </div>

          <button className="absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm">
            ‹
          </button>
          <button className="absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm">
            ›
          </button>
        </div>
      </section>

      <section aria-label="Shopping benefits" className="mx-auto grid max-w-[1600px] gap-px border-y border-[#e5e1dc] bg-[#e5e1dc] sm:grid-cols-3">
        {[
          { title: "Free delivery", detail: "On orders over LKR 4,500", icon: "↗" },
          { title: "Easy returns", detail: "14-day hassle-free returns", icon: "↺" },
          { title: "Secure checkout", detail: "Your payment details stay protected", icon: "✓" },
        ].map((benefit) => (
          <div key={benefit.title} className="flex items-center gap-4 bg-[#f8f7f5] px-6 py-5 sm:justify-center">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9d7d2] text-lg text-[#111111]">{benefit.icon}</span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[#111111]">{benefit.title}</h2>
              <p className="mt-1 text-xs text-[#686662]">{benefit.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">Find your next favorite</p>
          <h2 className="mt-2 text-[2.4rem] font-light uppercase tracking-[-0.06em] text-[#111111]">Shop by category</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryProduct = products.find((product) => product.category === category.slug);
            const image = categoryProduct?.image || category.image;
            const itemCount = products.filter((product) => product.category === category.slug).length;

            return (
              <Link
                key={category.slug}
                href={`/shop-with-sidebar?category=${category.slug}`}
                className="group relative isolate flex min-h-[310px] items-end overflow-hidden rounded-[12px] bg-[#e8e3dd] p-6 text-white sm:min-h-[360px]"
              >
                <Image
                  src={image}
                  alt={categoryProduct?.name || `${category.name} collection`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="relative z-20 flex w-full items-end justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-semibold uppercase tracking-[-0.04em]">{category.name}</h3>
                    <p className="mt-2 text-sm text-white/85">{category.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-white/75">
                      {itemCount ? `${itemCount} ${itemCount === 1 ? "style" : "styles"}` : "Explore the collection"}
                    </p>
                  </div>
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 text-xl transition group-hover:bg-white group-hover:text-[#111111]">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="pb-8 pt-10">
        {womenProducts.length > 0 && (
          <ProductGrid title={landing.womenSectionTitle} products={womenProducts} category="women" />
        )}
        {menProducts.length > 0 && (
          <ProductGrid title={landing.menSectionTitle} products={menProducts} category="men" />
        )}
        {womenProducts.length === 0 && menProducts.length === 0 && (
          <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
            <div className="rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
              No saved products are available for the landing page yet.
            </div>
          </div>
        )}
      </div>

      {saleProducts.length > 0 && (
        <div className="pb-10 pt-4">
          <ProductGrid title="Sale picks" products={saleProducts} />
        </div>
      )}

      <a
        href="#top"
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-[#111111] shadow-[0_10px_30px_rgba(17,17,17,0.12)]"
      >
        ↑
      </a>
    </main>
  );
};

export default Home;
