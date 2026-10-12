import { getLandingSettings, getProducts } from "@/lib/storeData";
import Image from "next/image";
import Link from "next/link";
import HomeProductCarousel from "@/components/Home/HomeProductCarousel";
import ShopByCategory from "@/components/Home/ShopByCategory";

const Home = async () => {
  const landing = await getLandingSettings();
  const products = await getProducts();
  const womenProducts = products.filter((product) => product.category === "women").slice(0, 4);
  const menProducts = products.filter((product) => product.category === "men").slice(0, 4);
  const saleProducts = products
    .filter((product) => Number(product.discountPercentage) > 0)
    .sort((first, second) => Number(second.discountPercentage) - Number(first.discountPercentage))
    .slice(0, 4);
  const latestProducts = [...products]
    .sort((first, second) => new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime())
    .slice(0, 8);
  const categories = [
    { name: "Women", slug: "women" as const, image: "/images/categories/categories-01.png", description: "Everyday pieces, made to feel special." },
    { name: "Men", slug: "men" as const, image: "/images/categories/categories-02.png", description: "Easy layers and modern essentials." },
  ];

  return (
    <main id="top" className="min-h-screen bg-white pt-20 text-[#111111] lg:pt-24">
      <section className="w-full overflow-hidden bg-[#f2f0ee] px-0 pb-0 pt-0">
        <div className="relative h-[min(78svh,780px)] min-h-[520px] w-full overflow-hidden bg-[#171717]">
          <Image
            src={landing.heroImage}
            alt={landing.heroTitle || "hero"}
            fill
            priority
            className="h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/25 to-transparent sm:bg-gradient-to-l sm:from-white/25 sm:via-white/5 sm:to-transparent" />

          <div className="absolute inset-0 flex items-center justify-start px-6 py-9 sm:px-[12%] lg:px-[40%]">
            <div className="w-full max-w-sm text-left text-[#111111]">
              {landing.heroBadge && (
                <div className="mb-4 inline-flex rounded-full border border-black/25 bg-white/55 px-4 py-2 text-xs font-semibold text-[#111111] backdrop-blur-sm sm:mb-6 sm:text-sm">
                  {landing.heroBadge}
                </div>
              )}

              <h1 className="max-w-[9ch] text-4xl font-medium leading-[1.02] tracking-normal sm:text-5xl lg:text-[3.5rem]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {landing.heroTitle || "Be Better Everyday"}
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-black/75 sm:text-base">{landing.heroSubtitle || "Comfort-first style for wherever the day takes you."}</p>

              <div className="mt-5 flex flex-wrap justify-start gap-2.5 sm:mt-6">
                <Link href="/shop-with-sidebar?category=men" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[2px] bg-[#817767] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#6f6659] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#817767]">Shop men <span aria-hidden="true">→</span></Link>
                <Link href="/shop-with-sidebar?category=women" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[2px] bg-[#817767] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#6f6659] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#817767]">Shop women <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeProductCarousel title="Shop the latest styles" products={latestProducts} />

      <ShopByCategory categories={categories} products={products} />

      <HomeProductCarousel title={landing.womenSectionTitle || "Women's collection"} products={womenProducts} category="women" />
      <HomeProductCarousel title={landing.menSectionTitle || "Men's collection"} products={menProducts} category="men" />

      {saleProducts.length > 0 && (
        <HomeProductCarousel title="Last chance · Sale picks" products={saleProducts} />
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
