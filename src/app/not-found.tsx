import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content/site";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-gradient p-6 text-center text-white">
      <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={180} height={58} className="h-14 w-auto rounded bg-white/95 p-2" />
      <p className="mt-8 font-display text-7xl font-extrabold">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-white/80">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
      </p>
      <Button asChild variant="white" size="lg" className="mt-8">
        <Link href="/">Back to ICAFoW 2026</Link>
      </Button>
    </div>
  );
}
