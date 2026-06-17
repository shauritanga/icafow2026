import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  // Registration is handled by on-page modals, so the single-page site has one route.
  const routes = [""];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
