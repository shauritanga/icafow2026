import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { verifyVerifyToken } from "@/lib/verify-token";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckInButton } from "@/components/verify/check-in-button";

export const metadata: Metadata = {
  title: "Verify Registration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const siteConfig = await getSiteSettings();

  const registrationId = verifyVerifyToken(token);
  const registration = registrationId
    ? await prisma.registration.findUnique({ where: { id: registrationId } })
    : null;

  const valid = registration?.status === "CONFIRMED";
  const session = await auth();
  const isStaff = !!session?.user?.email;

  return (
    <div className="section-light flex min-h-dvh flex-col bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container-edge flex h-16 items-center">
          <Link href="/">
            <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={140} height={44} className="h-9 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!registration || !valid ? (
            <Card className="overflow-hidden">
              <div className="bg-destructive px-6 py-10 text-center text-white">
                <XCircle className="mx-auto size-16" />
                <h1 className="mt-3 font-display text-3xl font-bold tracking-wide">INVALID</h1>
                <p className="mt-2 text-sm text-white/85">
                  {!registration
                    ? "This code is not recognized."
                    : "This registration is not confirmed (unpaid or cancelled)."}
                </p>
              </div>
              {registration && (
                <div className="space-y-3 p-6 text-sm">
                  <Row label="Name" value={registration.fullName} />
                  <Row label="Reference" value={<span className="font-mono">{registration.reference}</span>} />
                  <Row label="Status" value={registration.status} />
                </div>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="bg-brand-gradient px-6 py-10 text-center text-white">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <CheckCircle2 className="size-9" />
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-wide">VALID</h1>
                <p className="mt-1 text-sm text-white/85">
                  Registration confirmed for {siteConfig.name}
                </p>
              </div>

              <div className="space-y-3 p-6 text-sm">
                <Row label="Name" value={<span className="font-semibold">{registration.fullName}</span>} />
                <Row label="Pass" value={registration.packageLabel ?? registration.type} />
                <Row label="Reference" value={<span className="font-mono">{registration.reference}</span>} />
                {registration.organization && <Row label="Organization" value={registration.organization} />}
                <Row
                  label="Check-in"
                  value={
                    registration.seats > 1 ? (
                      <Badge variant={registration.checkedInCount >= registration.seats ? "gold" : "green"}>
                        {registration.checkedInCount} of {registration.seats} entered
                      </Badge>
                    ) : registration.checkedInCount >= 1 ? (
                      <Badge variant="gold">
                        Entered{registration.checkedInAt ? ` ${formatDate(registration.checkedInAt, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}` : ""}
                      </Badge>
                    ) : (
                      <Badge variant="green">Not yet entered</Badge>
                    )
                  }
                />
              </div>

              <div className="border-t border-border bg-muted/40 p-6">
                {registration.checkedInCount >= registration.seats ? (
                  <p className="text-center text-sm font-semibold text-gold">
                    {registration.seats > 1
                      ? `✓ All ${registration.seats} entered`
                      : "⚠ Already entered"}
                    {registration.checkedInAt
                      ? ` · first at ${formatDate(registration.checkedInAt, { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </p>
                ) : isStaff ? (
                  <CheckInButton token={token} seats={registration.seats} checkedInCount={registration.checkedInCount} />
                ) : (
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-secondary" />
                    {registration.seats > 1
                      ? `${registration.checkedInCount} of ${registration.seats} entered — staff will check you in`
                      : "Verified entrance pass — staff will check you in"}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
