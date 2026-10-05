import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// get all header settings
export const getHeaderSettings = unstable_cache(
  async () => {
    try {
      return await prisma.headerSetting.findFirst();
    } catch (error) {
      return {
        id: 1,
        headerText: "Free delivery on orders over $100",
        headerLogo: "/images/logo/logo.svg",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
  },
  ['header-setting'], { tags: ['header-setting'] }
);
