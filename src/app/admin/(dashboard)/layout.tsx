import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, FileText, Megaphone, Store, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content/site";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/papers", label: "Papers", icon: FileText },
  { href: "/admin/sponsors", label: "Sponsors", icon: Megaphone },
  { href: "/admin/exhibitors", label: "Exhibitors", icon: Store },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={130} height={42} className="h-8 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary">
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="px-3 pb-2 text-xs text-muted-foreground">{session.user.email}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <LogOut className="size-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5 lg:hidden">
          <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={120} height={40} className="h-8 w-auto" />
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <Button type="submit" variant="ghost" size="sm"><LogOut className="size-4" /></Button>
          </form>
        </header>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 lg:hidden">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
