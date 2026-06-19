import type { Metadata } from "next";
import { siteConfig } from "@/lib/content/site";

const ogImage = "/assets/og-image.jpg";

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.longName}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "ICAFoW 2026",
    "AI conference Africa",
    "Future of Work",
    "Artificial Intelligence Tanzania",
    "ARIFA",
    "AI conference Dar es Salaam",
    "JNICC conference",
    "AI policy Africa",
    "machine learning conference",
  ],
  authors: [{ name: siteConfig.host }],
  creator: siteConfig.host,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.longName}`,
    description: siteConfig.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.longName}`,
    description: siteConfig.description,
    images: [ogImage],
    creator: "@arifa_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteConfig.url },
  category: "technology",
};

/** JSON-LD structured data for the conference (schema.org/Event). */
export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${siteConfig.name} — ${siteConfig.longName}`,
    description: siteConfig.description,
    startDate: siteConfig.dates.startISO,
    endDate: siteConfig.dates.endISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: siteConfig.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.venue.address,
        addressLocality: siteConfig.venue.city,
        addressCountry: "TZ",
      },
    },
    image: [new URL(ogImage, siteConfig.url).toString()],
    organizer: {
      "@type": "Organization",
      name: siteConfig.host,
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/#registration`,
      price: "200",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2026-03-01T00:00:00+03:00",
    },
    url: siteConfig.url,
  };
}
