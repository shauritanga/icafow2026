"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/components/site-provider";
import { navItems, registrationRoutes } from "@/lib/content/nav";
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/social-icons";

export function Footer() {
  const siteConfig = useSiteSettings();

  const socialIcons = [
    { icon: LinkedinIcon, href: siteConfig.socials.linkedin, label: "LinkedIn" },
    { icon: TwitterIcon, href: siteConfig.socials.twitter, label: "Twitter / X" },
    { icon: FacebookIcon, href: siteConfig.socials.facebook, label: "Facebook" },
    { icon: InstagramIcon, href: siteConfig.socials.instagram, label: "Instagram" },
    { icon: YoutubeIcon, href: siteConfig.socials.youtube, label: "YouTube" },
    { icon: TiktokIcon, href: siteConfig.socials.tiktok, label: "TikTok" },
  ];

  return (
    <footer className="bg-maroon-dark text-white">
      <div className="container-edge py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Image
              src="/assets/logo-icafow-white.png"
              alt={siteConfig.name}
              width={240}
              height={80}
              className="h-16 w-auto lg:h-20"
            />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              {siteConfig.longName}. Hosted by {siteConfig.host}. Shaping Africa&apos;s
              AI-powered future of work.
            </p>
            <div className="flex gap-2">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">Explore</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">Get Involved</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {registrationRoutes.map((r) => (
                <li key={r.type}>
                  <Link href={r.href} className="transition-colors hover:text-white">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2.5">
                <MapPin className="size-4 shrink-0 text-white/50" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="size-4 shrink-0 text-white/50" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="size-4 shrink-0 text-white/50" />
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white">
                  {siteConfig.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.host}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>{siteConfig.dates.label}</span>
            <span aria-hidden>·</span>
            <span>{siteConfig.venue.name}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
