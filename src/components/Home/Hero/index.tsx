import { getHeroBanners, getHeroSliders } from "@/get-api-data/hero";
import HeroBannerItem from "./HeroBannerItem";
import HeroCarousel from "./HeroCarousel";

const Hero = async () => {
  const data = await getHeroBanners();
  const sliders = await getHeroSliders();

  return (
    <section className="overflow-hidden min-h-screen flex items-center pb-0 pt-0 bg-[#F7F7F7]">
      {/* Full-bleed carousel */}
      <div className="w-full px-0">
        <div className="relative w-full">
          <HeroCarousel sliders={sliders} />
        </div>
      </div>

      {/* Side banner items (kept in container for layout) */}
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0 mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="hidden xl:block xl:col-span-2" />

          <div className="flex flex-col justify-between w-full gap-5 xl:col-span-1 sm:flex-row xl:flex-col">
            {data.map((bannerItem, key: number) => (
              <HeroBannerItem key={key} bannerItem={bannerItem} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
