"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { IHeroSlider } from "@/types/hero";

const HeroCarousal = ({ sliders }: { sliders: any }) => {
  return (
    <div className="hero-fullbleed">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination]}
        className="hero-carousel h-[100vh]"
      >
        {sliders?.map((slider: IHeroSlider, key: number) => (
          <SwiperSlide key={key}>
            <div
              className="relative h-full w-full overflow-hidden hero-slide-bg"
              style={{
                backgroundImage: `url(${slider?.sliderImage ? slider?.sliderImage : "/no-image.jpg"})`,
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.1)_30%,rgba(147,170,198,0.22)_55%,rgba(147,170,198,0.5)_100%)]" />

              <div className="absolute inset-0 z-30 flex items-center justify-end px-4 sm:px-8 lg:px-12">
                <div className="hero-overlay w-full max-w-[680px] py-8 text-left sm:py-10 lg:py-14">
                  <div className="mb-3 flex items-center justify-start gap-3 text-dark">
                    <span className="block text-[30px] font-semibold sm:text-[42px] lg:text-[54px]">
                      {slider?.discountRate}%
                    </span>
                    <span className="block text-xs uppercase tracking-[0.2em] sm:text-sm">
                      Sale
                      <br />
                      Off
                    </span>
                  </div>

                  <h1 className="mb-3 font-black leading-[0.82] tracking-[-0.06em] text-dark text-[3.3rem] sm:text-[5.2rem] lg:text-[8rem]">
                    <Link href={`/products/${slider?.product?.slug}`} className="block">
                      Designed
                    </Link>
                    <Link href={`/products/${slider?.product?.slug}`} className="block">
                      for you
                    </Link>
                    <span className="mt-2 block text-[1.2rem] font-medium italic tracking-[-0.04em] text-dark/80 sm:text-[2rem] lg:text-[3.2rem]">
                      Trusted by All
                    </span>
                  </h1>

                  <Link
                    href={`/products/${slider?.product?.slug}`}
                    className="mt-4 inline-flex rounded-lg border border-[#111] bg-white/90 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-black duration-200 ease-out hover:bg-white sm:px-8"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousal;
