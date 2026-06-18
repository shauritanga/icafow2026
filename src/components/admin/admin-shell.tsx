"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, CreditCard, FileText, Megaphone, Store, LogOut, PanelLeft, Mic2, Bell, SunMoon, User, Settings, Handshake, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content/site";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/attendees", label: "Attendees", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/papers", label: "Papers", icon: FileText },
  { href: "/admin/speakers", label: "Speakers", icon: Mic2 },
  { href: "/admin/sponsors", label: "Sponsors", icon: Megaphone },
  { href: "/admin/exhibitors", label: "Exhibitors", icon: Store },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/pitch", label: "Pitch", icon: Lightbulb },
];

export function AdminShell({ userEmail, userAvatar, children }: { userEmail: string; userAvatar?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = React.useState(false);

  // Determine current page for breadcrumbs
  const currentNav = navLinks.find(l => l.href === pathname) || navLinks[0];
  const pageTitle = `Dashboard > ${currentNav.label}`;

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "A";

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      {/* Sidebar */}
      <aside 
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-background transition-all duration-300 lg:flex",
          isCollapsed ? "w-[72px]" : "w-60"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-border">
          {isCollapsed ? (
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 font-bold text-primary">
              I
            </div>
          ) : (
            <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={130} height={42} className="h-8 w-auto px-5" />
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navLinks.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
            return (
              <Link 
                key={l.href} 
                href={l.href} 
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-muted hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-foreground/80",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? l.label : undefined}
              >
                <l.icon className="size-5 shrink-0" /> 
                {!isCollapsed && <span className="text-sm">{l.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 relative">
           <button 
             onClick={() => setIsSidebarDropdownOpen(!isSidebarDropdownOpen)}
             className={cn("flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted", isCollapsed && "justify-center")}
           >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden">
                 {userAvatar ? <img src={userAvatar} alt="Avatar" className="size-full object-cover" /> : userInitial}
              </div>
              {!isCollapsed && (
                 <div className="flex flex-col items-start overflow-hidden text-left">
                   <span className="text-sm font-medium leading-none truncate w-32">{userEmail}</span>
                   <span className="text-xs text-muted-foreground mt-1.5">Admin</span>
                 </div>
              )}
           </button>
           
           {isSidebarDropdownOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setIsSidebarDropdownOpen(false)} />
               <div className={cn(
                 "absolute z-50 overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg w-56",
                 isCollapsed ? "left-full bottom-0 ml-2" : "bottom-full left-3 mb-2"
               )}>
                 <div className="px-4 py-3 border-b border-border bg-muted/30">
                   <p className="text-sm font-semibold truncate">{userEmail}</p>
                   <p className="text-xs text-muted-foreground">Administrator</p>
                 </div>
                 <div className="py-1">
                   <Link href="/admin/profile" className="flex w-full items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsSidebarDropdownOpen(false)}>
                     <User className="mr-3 size-4 text-muted-foreground" /> Profile
                   </Link>
                   <Link href="/admin/settings" className="flex w-full items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsSidebarDropdownOpen(false)}>
                     <Settings className="mr-3 size-4 text-muted-foreground" /> Settings
                   </Link>
                 </div>
                 <div className="border-t border-border py-1">
                   <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
                     <LogOut className="mr-3 size-4" /> Sign out
                   </button>
                 </div>
               </div>
             </>
           )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 lg:px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden text-muted-foreground lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeft className="size-5" />
            </Button>
            {/* Mobile branding */}
            <div className="flex items-center lg:hidden">
              <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={120} height={40} className="h-8 w-auto" />
            </div>
            
            <h1 className="hidden text-sm sm:flex sm:items-center lg:ml-2">
              <span className="font-normal text-muted-foreground">{pageTitle.split(" > ")[0]}</span>
              <span className="mx-2 text-muted-foreground/50">&gt;</span>
              <span className="font-semibold text-foreground">{pageTitle.split(" > ")[1]}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted">
               <Bell className="size-5" />
             </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted" onClick={toggleTheme}>
               <SunMoon className="size-5" />
             </Button>
             
             {/* Avatar Dropdown */}
             <div className="relative">
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold hover:ring-2 hover:ring-primary/30 transition-all ml-1"
               >
                 {userAvatar ? <img src={userAvatar} alt="Avatar" className="size-full object-cover rounded-full" /> : userInitial}
               </button>
               
               {isDropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                   <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-background text-foreground shadow-lg z-50 overflow-hidden">
                     <div className="px-4 py-3 border-b border-border bg-muted/30">
                       <p className="text-sm font-semibold truncate">{userEmail}</p>
                       <p className="text-xs text-muted-foreground">Administrator</p>
                     </div>
                     <div className="py-1">
                       <Link href="/admin/profile" className="flex w-full items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsDropdownOpen(false)}>
                         <User className="mr-3 size-4 text-muted-foreground" /> Profile
                       </Link>
                       <Link href="/admin/settings" className="flex w-full items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsDropdownOpen(false)}>
                         <Settings className="mr-3 size-4 text-muted-foreground" /> Settings
                       </Link>
                     </div>
                     <div className="border-t border-border py-1">
                       <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
                         <LogOut className="mr-3 size-4" /> Sign out
                       </button>
                     </div>
                   </div>
                 </>
               )}
             </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 lg:hidden">
          {navLinks.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
            return (
              <Link 
                key={l.href} 
                href={l.href} 
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
