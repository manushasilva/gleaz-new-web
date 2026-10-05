import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

const safeFallbackSeo = {
  siteTitle: "CozyCommerce",
  metadescription: "Modern clothing and lifestyle essentials for everyday confidence.",
  metaKeywords: "clothing, fashion, modern essentials, boutique",
  metaImage: "",
  favicon: "/favicon.ico",
  gtmId: "",
  siteName: "CozyCommerce",
};

const safeFallbackLogo = "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746335068/header/tsvfm6pvfwpbpyqdtxwn.svg";
const safeFallbackEmailLogo = "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746693785/logo_ouegg7.png";

// get all seo settings
export const getSeoSettings = unstable_cache(
  async () => {
    try {
      return await prisma.seoSetting.findFirst();
    } catch (error) {
      return safeFallbackSeo as any;
    }
  },
  ['seo-setting'], { tags: ['seo-setting'] }
);

export const getSiteName = unstable_cache(
  async () => {
    try {
      const siteName = await prisma.seoSetting.findFirst({
        select: {
          siteName: true,
        },
      });
      return siteName ? siteName.siteName : process.env.SITE_NAME ? process.env.SITE_NAME : "Cozy-commerce";
    } catch (error) {
      return process.env.SITE_NAME ? process.env.SITE_NAME : "Cozy-commerce";
    }
  },
  ['site-name'], { tags: ['site-name'] }
);

// get logo 
export const getLogo = unstable_cache(
  async () => {
    try {
      const headerLogo = await prisma.headerSetting.findFirst({
        select: {
          headerLogo: true,
        },
      });
      return headerLogo ? headerLogo.headerLogo : safeFallbackLogo;
    } catch (error) {
      return safeFallbackLogo;
    }
  },
  ['header-logo'], { tags: ['header-logo'] }
);

// get email logo
export const getEmailLogo = unstable_cache(
  async () => {
    try {
      const emailLogo = await prisma.headerSetting.findFirst({
        select: {
          emailLogo: true,
        },
      });
      return emailLogo ? emailLogo.emailLogo : safeFallbackEmailLogo;
    } catch (error) {
      return safeFallbackEmailLogo;
    }
  },
  ['email-logo'], { tags: ['email-logo'] }
);

