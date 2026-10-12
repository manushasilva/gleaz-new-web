import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/assets/icons/social'
import Link from 'next/link'

const socials = [
  {
    id: 1,
    href: 'https://web.facebook.com/profile.php?id=100054244658342',
    name: 'Facebook',
    icon: FacebookIcon,
  },
  {
    id: 2,
    href: 'https://www.instagram.com/gleaz.fashion',
    name: 'Instagram',
    icon: InstagramIcon,
  },
  {
    id: 3,
    href: 'https://wa.me/94754081108',
    name: 'WhatsApp @gleaz.fasion',
    icon: WhatsAppIcon,
  },
]

export default function FooterSocials() {
  return (
    <div className="flex items-center gap-4 mt-7.5">
      {
        socials.map((social) => (
          <Link
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex ease-out duration-200 hover:text-blue"
          >
            <span className="sr-only">{social.name} link</span>
            <social.icon />
          </Link>
        ))}
    </div>
  )
}
