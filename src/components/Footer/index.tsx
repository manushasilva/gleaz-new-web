import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/assets/icons/social";
import Link from "next/link";
import AccountLinks from "./AccountLinks";
import FooterBottom from "./FooterBottom";
import QuickLinks from "./QuickLinks";

const Footer = () => {
  return (
    <footer className="overflow-hidden border-t border-gray-3">
      <div className="px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-20">
          <div className="max-w-[330px] w-full">
            <h2 className="mb-7.5 text-xl font-semibold text-dark">
              Help & Support
            </h2>

            <ul className="flex flex-col gap-3">
              <li className="flex gap-4.5 text-base">
                <span className="shrink-0">
                  <MapIcon className="fill-blue" width={24} height={24} />
                </span>
                40/D/2 , Horathuduwa Circular Road, Halpita
              </li>

              <li>
                <Link
                  href="tel:+94754081108"
                  className="flex items-center gap-4.5 text-base"
                >
                  <CallIcon className="fill-blue" width={24} height={24} />
                  +94 75 408 1108
                </Link>
              </li>

              <li>
                <Link
                  href="tel:+94712770257"
                  className="flex items-center gap-4.5 text-base"
                >
                  <CallIcon className="fill-blue" width={24} height={24} />
                  +94 71 277 0257
                </Link>
              </li>

              <li>
                <Link
                  href="mailto:gleaz.fashion@gmail.com"
                  className="flex items-center gap-4.5 text-base"
                >
                  <EmailIcon className="fill-blue" width={24} height={24} />
                  gleaz.fashion@gmail.com
                </Link>
              </li>
            </ul>

            {/* <!-- Social Links start --> */}
            <div className="flex items-center gap-4 mt-7.5">
              <Link
                href="https://web.facebook.com/profile.php?id=100054244658342"
                target="_blank"
                rel="noopener noreferrer"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">Facebook link</span>
                <FacebookIcon />
              </Link>

              <Link
                href="https://www.instagram.com/gleaz.fashion"
                target="_blank"
                rel="noopener noreferrer"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">Instagram link</span>
                <InstagramIcon />
              </Link>

              <Link
                href="https://wa.me/94754081108"
                target="_blank"
                rel="noopener noreferrer"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">WhatsApp @gleaz.fasion</span>
                <WhatsAppIcon />
              </Link>
            </div>
            {/* <!-- Social Links end --> */}
          </div>

          <AccountLinks />

          <QuickLinks />
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      <FooterBottom />
    </footer>
  );
};

export default Footer;
