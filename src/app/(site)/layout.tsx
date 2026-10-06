import Footer from "../../components/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";
import Providers from "./Providers";
import NextTopLoader from "nextjs-toploader";
import MainHeader from "@/components/Header/MainHeader";
import HeaderSwitcher from "@/components/Header/HeaderSwitcher";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SupportChat from "@/components/Common/SupportChat";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerSettingData = await getHeaderSettings();
  return (
    <div>
      <PreLoader />
      <>
        <Providers>
          <NextTopLoader
            color="#3C50E0"
            crawlSpeed={300}
            showSpinner={false}
            shadow="none"
          />
          <HeaderSwitcher headerData={headerSettingData} />
          <Breadcrumb />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
          <SupportChat />
        </Providers>

        <ScrollToTop />
        <Footer />
      </>
    </div>
  );
}
