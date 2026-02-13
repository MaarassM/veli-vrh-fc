export interface SocialLink {
  platform: "facebook" | "instagram" | "twitter" | "youtube";
  url: string;
  label: string;
}

export interface ContactInfo {
  clubName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  email: string;
  socialLinks: SocialLink[];
}
