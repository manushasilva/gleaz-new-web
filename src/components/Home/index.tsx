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

          <div className="absolute inset-0 flex items-end justify-end px-5 pb-9 sm:items-center sm:px-10 sm:py-12 lg:px-16">
            <div className="max-w-2xl text-right text-[#111111]">
              {landing.heroBadge && (
                <div className="mb-4 inline-flex rounded-full border border-black/25 bg-white/55 px-4 py-2 text-xs font-semibold text-[#111111] backdrop-blur-sm sm:mb-6 sm:text-sm">
                  {landing.heroBadge}
                </div>
              )}

              <h1 className="ml-auto max-w-[12ch] text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl" style={{ fontFamily: "var(--font-display)" }}>
                {landing.heroTitle || "Be Better Everyday"}
              </h1>
              <p className="ml-auto mt-4 max-w-lg text-base leading-7 text-black/75 sm:mt-5 sm:text-lg">{landing.heroSubtitle || "Comfort-first style for wherever the day takes you."}</p>

              <div className="mt-7 flex flex-wrap justify-end gap-3 sm:mt-8">
                <Link href="/shop-with-sidebar?category=men" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#eee] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Shop men <span aria-hidden="true">→</span></Link>
                <Link href="/shop-with-sidebar?category=women" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-black/70 bg-white/55 px-6 py-3 text-sm font-semibold text-[#111] backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">Shop women <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeProductCarousel title="Shop the latest styles" products={latestProducts} />

      <section className="mx-auto grid max-w-[1600px] gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:gap-6 lg:px-8">
        {[
          { title: "Find your everyday favorite", label: "WOMEN'S COLLECTION", href: "/shop-with-sidebar?category=women", image: womenProducts[0]?.image || categories[0].image },
          { title: "Made to move with you", label: "MEN'S COLLECTION", href: "/shop-with-sidebar?category=men", image: menProducts[0]?.image || categories[1].image },
        ].map((feature) => (
          <Link key={feature.href} href={feature.href} className="group relative flex min-h-[340px] items-end overflow-hidden rounded-2xl bg-[#222] p-6 text-white sm:min-h-[420px] sm:rounded-3xl sm:p-9">
            <Image src={feature.image} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="relative z-10 max-w-md">
              <span className="text-xs font-semibold tracking-[0.12em] text-white/80">{feature.label}</span>
              <span className="mt-2 block text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">{feature.title}</span>
              <span className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#111] transition group-hover:bg-[#eee]">Shop now <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        ))}
      </section>

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
