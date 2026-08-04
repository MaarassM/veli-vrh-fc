import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'NK Veli Vrh';
const BASE_URL = 'https://nkvelivrh.com';
const DEFAULT_DESCRIPTION =
  'NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra. Pratite rezultate, vijesti i raspored utakmica.';
const DEFAULT_KEYWORDS =
  'NK Veli Vrh, veli vrh, pula nogomet, Istra, HNS, 5. liga Istra, nk veli vrh, istrasport, nogomet pula';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/team-celebration.jpg`;

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  noindex = false,
}: SEOProps) {
  const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="hr_HR" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
