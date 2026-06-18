import { prisma } from "@/lib/prisma";
import { siteConfig } from "./content/site";

export async function getSiteSettings() {
  const dbSettings = await prisma.siteSetting.findUnique({
    where: { id: "global" }
  });

  const customData = (dbSettings?.data as any) || {};

  return {
    ...siteConfig,
    contact: {
      ...siteConfig.contact,
      ...customData.contact
    },
    socials: {
      ...siteConfig.socials,
      ...customData.socials
    }
  };
}
