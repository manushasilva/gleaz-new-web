import "./css/style.css";
import { Metadata } from "next";
import { getSeoSettings, getSiteName } from "@/get-api-data/seo-setting";
import { GoogleTagManager } from '@next/third-parties/google';
import { DM_Sans } from 'next/font/google'

const dm_sans = DM_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-body",
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  const site_name = await getSiteName();
  return {
    title: `${seoSettings?.siteTitle || "GLEAZ"} | ${site_name}`,
    description: seoSettings?.metadescription || "GLEAZ is a modern clothing brand offering elevated everyday essentials and premium fashion essentials.",
    keywords: seoSettings?.metaKeywords || "GLEAZ, clothing, fashion, boutique, modern apparel",
    openGraph: {
      images: seoSettings?.metaImage ? [seoSettings.metaImage] : [],
    },
    icons: {
      icon: seoSettings?.favicon || "/images/logo/gleaz-logo.svg",
      shortcut: seoSettings?.favicon || "/images/logo/gleaz-logo.svg",
      apple: seoSettings?.favicon || "/images/logo/gleaz-logo.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seoSettings = await getSeoSettings();
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={dm_sans.variable}>
        {children}
        {seoSettings?.gtmId && <GoogleTagManager gtmId={seoSettings.gtmId} />}
      </body>
    </html>
  );
}
