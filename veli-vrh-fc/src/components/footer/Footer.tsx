import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { contactInfo } from '@/data/contact';
import type { SocialLink } from '@/types';

const socialIcons: Record<SocialLink['platform'], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Club info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              {contactInfo.clubName}
            </h3>
            <p className="text-sm leading-relaxed">
              Nogometni klub Veli Vrh — tradicija, strast i zajedništvo. Ponosno
              zastupamo naš kvart na terenu i izvan njega.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Brzi linkovi</h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li>
                {contactInfo.address.street}, {contactInfo.address.postalCode}{' '}
                {contactInfo.address.city}
              </li>
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-orange-400 transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="hover:text-orange-400 transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>{contactInfo.officeHours}</li>
            </ul>
          </div>
        </div>

        {/* Social links */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {contactInfo.socialLinks.map((social) => {
            const Icon = socialIcons[social.platform];
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded-full p-2 text-gray-400 hover:text-orange-400 transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm">
          &copy; {currentYear} NK Veli Vrh. Sva prava pridržana.
        </div>
      </div>
    </footer>
  );
}
