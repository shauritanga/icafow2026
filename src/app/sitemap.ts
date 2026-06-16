import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const routes = [
    "",
    "/register/attendee",
    "/register/sponsor",
    "/register/exhibitor",
    "/register/partner",
    "/register/speaker",
    "/register/pitch",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
