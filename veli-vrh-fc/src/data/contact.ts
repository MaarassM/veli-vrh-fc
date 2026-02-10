import type { ContactInfo } from '../types';

export const contactInfo: ContactInfo = {
  clubName: 'NK Veli Vrh',
  address: {
    street: 'Veli Vrh 1',
    city: 'Pula',
    postalCode: '52100',
    country: 'Hrvatska',
  },
  email: 'info@nkvelivrh.hr',
  phone: '+385 52 123 456',
  socialLinks: [
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/nkvelivrh',
      label: 'Facebook',
    },
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/nkvelivrh',
      label: 'Instagram',
    },
  ],
  officeHours: 'Pon - Pet: 17:00 - 20:00',
};
