import { CallIcon, EmailIcon, MapIcon } from '@/assets/icons'
import FooterSocials from './FooterSocials'

const aboutData = [
  {
    id: 1,
    icon: MapIcon,
    text: '40/D/2, Horathuduwa Circular Road, Halpita',
  },
  {
    id: 2,
    icon: CallIcon,
    text: '+94 75 408 1108 / +94 71 277 0257',
  },
  {
    id: 3,
    icon: EmailIcon,
    text: 'gleaz.fashion@gmail.com',
  }
]

export default function FooterAbout() {
  return (
    <div className="max-w-[330px] w-full">
      <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
        Help & Support
      </h2>

      <ul className="flex flex-col gap-3">
        {
          aboutData.map((item) => (
            <li key={item.id} className="flex gap-4.5">
              <span className="shrink-0">
                <item.icon className="fill-blue" width={24} height={24} />
              </span>
              {item.text}
            </li>
          ))
        }
      </ul>

      <FooterSocials />
    </div>
  )
}
