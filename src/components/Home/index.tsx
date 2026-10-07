import Image from "next/image";
import Link from "next/link";
import { getLandingSettings, getProducts } from "@/lib/storeData";
import type { StoreProduct } from "@/lib/storeData";
import ShopByCategory from "@/components/Home/ShopByCategory";

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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7a7a7a] sm:text-xs">Collection</p>
        <h2 className="mt-2 text-[1.8rem] font-light uppercase tracking-[-0.06em] text-[#111111] sm:text-[2.2rem] lg:text-[2.6rem]">{title}</h2>
      </div>

      {category && (
        <Link
          href={`/shop-with-sidebar?category=${category}`}
          className="inline-flex items-center gap-2 self-start border border-[#d9d7d2] bg-white px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#111111] transition hover:bg-[#111111] hover:text-white sm:self-auto sm:text-xs"
        >
          See more
        </Link>
      )}
    </div>

    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
    <main id="top" className="min-h-screen bg-[#f4f4f2] text-[#111111] pt-20 lg:pt-24">
      <section className="w-full overflow-hidden bg-[#f2f0ee] px-0 pb-0 pt-0">
        <div className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-[#f4f2ef]">
          <Image
            src={landing.heroImage}
            alt={landing.heroTitle || "hero"}
            fill
            priority
            className="h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.08)_24%,rgba(147,170,198,0.22)_58%,rgba(147,170,198,0.58)_100%)]" />

          <div className="absolute inset-0 flex items-center justify-end px-4 sm:px-8 lg:px-12">
            <div className="max-w-[680px] text-left text-[#111111]">
              {landing.heroBadge && (
                <div className="mb-4 inline-flex rounded-full border border-black/10 bg-white/20 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#111] backdrop-blur-sm sm:mb-5 sm:px-4 sm:text-[0.7rem]">
                  {landing.heroBadge}
                </div>
              )}

              <h1 className="text-[2.8rem] leading-[0.72] tracking-[-0.07em] text-[#111111] sm:text-[4.1rem] md:text-[5.3rem] lg:text-[6.4rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                <span className="block">Designed</span>
                <span className="mt-1 block">for you</span>
                <span className="mt-6 block text-[0.95rem] tracking-[-0.03em] text-[#4a4a4a] sm:text-[1.5rem] md:text-[2rem] lg:text-[2.5rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
                  {landing.heroSubtitle}
                </span>
              </h1>

              <Link
                href={landing.ctaLink}
                className="mt-6 inline-flex border border-[#111] bg-white/80 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111] transition hover:bg-white sm:mt-8 sm:px-8 sm:py-4 sm:text-base"
              >
                {landing.ctaText}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Shopping benefits" className="mx-auto grid max-w-[1600px] gap-px border-y border-[#e5e1dc] bg-[#e5e1dc] grid-cols-1 sm:grid-cols-3">
        {[
          { title: "Free delivery", detail: "On orders over LKR 4,500", icon: "↗" },
          { title: "Easy returns", detail: "14-day hassle-free returns", icon: "↺" },
          { title: "Secure checkout", detail: "Your payment details stay protected", icon: "✓" },
        ].map((benefit) => (
          <div key={benefit.title} className="flex items-center gap-3 bg-[#f8f7f5] px-4 py-4 sm:justify-center sm:gap-4 sm:px-6 sm:py-5">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d7d2] text-base text-[#111111] sm:h-10 sm:w-10 sm:text-lg">{benefit.icon}</span>
            <div>
              <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#111111] sm:text-sm">{benefit.title}</h2>
              <p className="mt-1 text-[0.62rem] text-[#686662] sm:text-xs">{benefit.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <ShopByCategory categories={categories} products={products} />

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
