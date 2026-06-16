import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/content/site";
import { registrationRoutes } from "@/lib/content/nav";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-edge flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={140} height={44} className="h-9 w-auto" priority />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Back to site
          </Link>
        </div>
      </header>

      <div className="border-b border-border bg-background">
        <div className="container-edge flex flex-wrap gap-x-1 gap-y-1 py-2 text-sm">
          {registrationRoutes.map((r) => (
            <Link
              key={r.type}
              href={r.href}
              className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary aria-[current=page]:bg-accent aria-[current=page]:text-secondary"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background py-6">
        <div className="container-edge flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-secondary" /> Secure payments via Selcom · Visa, Mastercard, Tigo Pesa, M-Pesa
          </p>
          <p>© {new Date().getFullYear()} {siteConfig.host}</p>
        </div>
      </footer>
    </div>
  );
}
