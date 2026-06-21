import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, User, Mail, Phone, Building, MapPin, Briefcase, Calendar, CheckCircle2, CircleDollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/ui";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCurrencyExact, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ViewRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
  });

  if (!registration) {
    notFound();
  }

  let backLink = "/admin";
  let backText = "Dashboard";

  switch (registration.type) {
    case "ATTENDEE": backLink = "/admin/attendees"; backText = "Attendees"; break;
    case "SPEAKER": backLink = "/admin/speakers"; backText = "Speakers"; break;
    case "EXHIBITOR": backLink = "/admin/exhibitors"; backText = "Exhibitors"; break;
    case "SPONSOR": backLink = "/admin/sponsors"; backText = "Sponsors"; break;
    case "PARTNER": backLink = "/admin/partners"; backText = "Partners"; break;
    case "PITCH": backLink = "/admin/pitch"; backText = "Pitch Competition"; break;
  }

  const detailsObj = registration.details && typeof registration.details === 'object' ? registration.details : {};

  return (
    <Stagger className="h-full space-y-8 pb-10">
      {/* Breadcrumb Navigation */}
      <StaggerItem>
        <nav className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-6">
          <Link href="/admin" className="hover:text-foreground transition-colors flex items-center">
            <Home className="size-4 mr-1" />
            Dashboard
          </Link>
          <ChevronRight className="size-4 text-muted-foreground/50" />
          <Link href={backLink} className="hover:text-foreground transition-colors">
            {backText}
          </Link>
          <ChevronRight className="size-4 text-muted-foreground/50" />
          <span className="text-foreground">{registration.fullName || registration.organization || registration.reference}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {registration.fullName || registration.organization || "Registration Details"}
              </h1>
              <StatusBadge status={registration.status} />
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded-md border text-foreground/70">{registration.reference}</span>
              • Submitted on {formatDate(registration.createdAt)}
            </p>
          </div>
        </div>
      </StaggerItem>

      <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
        {/* Left/Main Column: Application Details */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
          <StaggerItem>
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 mb-6">
                    <User className="size-5 text-primary" /> Application Responses
                  </h3>
                  
                  {Object.keys(detailsObj).length > 0 ? (
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                      {Object.entries(detailsObj).map(([key, value]) => {
                        if (!value) return null;
                        const isLongText = typeof value === 'string' && value.length > 60;
                        const isImageUrl = typeof value === 'string' && value.startsWith('http') && (
                          value.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) !== null || 
                          key.toLowerCase().includes('logo') || 
                          key.toLowerCase().includes('photo') || 
                          key.toLowerCase().includes('headshot') || 
                          key.toLowerCase().includes('image')
                        );

                        return (
                          <div key={key} className={`space-y-1.5 ${isLongText ? 'md:col-span-2' : ''}`}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            {isImageUrl ? (
                              <div className="mt-2 size-32 rounded-xl overflow-hidden bg-muted/20 border border-border/50 flex items-center justify-center p-2">
                                <img src={value as string} alt={key} className="max-h-full max-w-full object-contain" />
                              </div>
                            ) : typeof value === 'string' && value.startsWith('http') ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium break-all">
                                {value}
                              </a>
                            ) : typeof value === 'string' && value.startsWith('data:image') ? (
                              <div className="mt-2 size-32 rounded-xl overflow-hidden bg-muted/20 border border-border/50 flex items-center justify-center p-2">
                                <img src={value} alt="Upload" className="max-h-full max-w-full object-contain" />
                              </div>
                            ) : (
                              <p className={`text-sm text-foreground leading-relaxed ${isLongText ? 'whitespace-pre-wrap bg-muted/20 p-4 rounded-xl border border-border/50 mt-2' : 'font-medium'}`}>
                                {String(value)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-muted/20 border border-dashed border-border/50">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckCircle2 className="size-6 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-semibold mb-1">Standard Registration</h4>
                      <p className="text-sm text-muted-foreground max-w-sm">This applicant did not provide any custom application details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </StaggerItem>
        </div>

        {/* Right Sidebar: Contact & Meta */}
        <div className="space-y-6">
          <StaggerItem>
            <div className="rounded-2xl border bg-card/50 text-card-foreground shadow-sm p-6 backdrop-blur-xl">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Briefcase className="size-4" /> Contact Profile
              </h3>
              <div className="space-y-4">
                {registration.email && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                    <a href={`mailto:${registration.email}`} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground/70" /> {registration.email}
                    </a>
                  </div>
                )}
                {registration.phone && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Phone</span>
                    <a href={`tel:${registration.phone}`} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                      <Phone className="size-3.5 text-muted-foreground/70" /> {registration.phone}
                    </a>
                  </div>
                )}
                {registration.organization && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Organization</span>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Building className="size-3.5 text-muted-foreground/70" /> {registration.organization}
                    </p>
                  </div>
                )}
                {registration.country && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Location</span>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground/70" /> {registration.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-2xl border bg-primary/5 text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CircleDollarSign className="size-4" /> Package details
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Selected Package</span>
                  <p className="text-sm font-medium text-primary">
                    {registration.packageLabel || "Standard Entry"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Amount Payable</span>
                  <p className="text-2xl font-bold tracking-tight">
                    {registration.amount > 0 ? formatCurrencyExact(registration.amount, registration.currency) : "Free"}
                  </p>
                </div>
                {registration.amount > 0 && registration.status !== "CONFIRMED" && (
                  <p className="text-xs text-muted-foreground/80 leading-relaxed pt-2 border-t border-primary/10">
                    Payment status is currently pending. The invoice was sent to the applicant's email.
                  </p>
                )}
              </div>
            </div>
          </StaggerItem>
        </div>
      </div>
    </Stagger>
  );
}
