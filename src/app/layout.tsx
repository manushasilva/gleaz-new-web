import "./css/style.css";
import { Metadata } from "next";
import { getSeoSettings } from "@/get-api-data/seo-setting";
import { GoogleTagManager } from '@next/third-parties/google';
import { DM_Sans, Montserrat } from 'next/font/google'

const siteUrl = "https://gleaz.io";

const dm_sans = DM_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-body",
  subsets: ['latin'],
})

const montserrat = Montserrat({
  weight: ['300','400','600','700','800'],
  variable: '--font-display',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: "GLEAZ | Modern Fashion, Elevated",
    description: seoSettings?.metadescription || "GLEAZ is a modern clothing brand offering elevated everyday essentials and premium fashion essentials.",
    keywords: seoSettings?.metaKeywords || "GLEAZ, clothing, fashion, boutique, modern apparel",
    openGraph: {
      url: siteUrl,
      images: seoSettings?.metaImage ? [seoSettings.metaImage] : [],
    },
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
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
      <body suppressHydrationWarning={true} className={`${dm_sans.variable} ${montserrat.variable}`}>
        {children}
        {seoSettings?.gtmId && <GoogleTagManager gtmId={seoSettings.gtmId} />}
      </body>
    </html>
  );
}
