import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { approxTZS } from "@/lib/rate";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/invoice/print-button";

export const metadata: Metadata = {
  title: "Invoice & Receipt",
  robots: { index: false, follow: false },
};

export default async function InvoicePage(props: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await props.params;
  const siteConfig = await getSiteSettings();

  const registration = await prisma.registration.findUnique({
    where: { reference: ref },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!registration) notFound();

  const payment = registration.payments.find((p) => p.status === "PAID") ?? registration.payments[0];
  const isPaid = payment?.status === "PAID";
  const issued = formatDate(registration.createdAt);

  return (
    <div className="section-light min-h-dvh bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="container-edge flex items-center justify-between print:hidden">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Home
        </Link>
        <PrintButton />
      </div>

      <div className="container-edge mt-6 print:mt-0">
        <article className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-8 shadow-sm print:border-0 print:shadow-none sm:p-10">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={170} height={56} className="h-12 w-auto" />
              <p className="mt-3 text-sm text-muted-foreground">
                {siteConfig.host}<br />
                {siteConfig.contact.address}<br />
                {siteConfig.contact.email}
              </p>
            </div>
            <div className="text-right">
              <h1 className="font-display text-2xl font-bold text-primary">
                {isPaid ? "RECEIPT" : "INVOICE"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">No. {registration.reference}</p>
              <p className="text-sm text-muted-foreground">Issued: {issued}</p>
              <div className="mt-2">
                {isPaid ? (
                  <Badge variant="green" className="gap-1"><CheckCircle2 className="size-3" /> PAID</Badge>
                ) : (
                  <Badge variant="gold">DUE</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bill to */}
          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Billed to</p>
              <p className="mt-1 font-semibold">{registration.fullName}</p>
              {registration.organization && <p className="text-sm">{registration.organization}</p>}
              <p className="text-sm text-muted-foreground">{registration.email}</p>
              {registration.phone && <p className="text-sm text-muted-foreground">{registration.phone}</p>}
              {registration.country && <p className="text-sm text-muted-foreground">{registration.country}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</p>
              <p className="mt-1 font-semibold">{siteConfig.name}</p>
              <p className="text-sm text-muted-foreground">{siteConfig.dates.label}</p>
              <p className="text-sm text-muted-foreground">{siteConfig.venue.name}</p>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3">
                  <span className="font-medium">{registration.packageLabel ?? registration.type}</span>
                  <span className="block text-xs text-muted-foreground">ICAFoW 2026 — {registration.type.toLowerCase()} registration</span>
                </td>
                <td className="py-3 text-center">1</td>
                <td className="py-3 text-right">{formatCurrency(registration.amount, registration.currency)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="py-3 text-right font-semibold">Total</td>
                <td className="py-3 text-right font-display text-lg font-bold text-primary">
                  {formatCurrency(registration.amount, registration.currency)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="text-right text-xs text-muted-foreground">Approx. charged (TZS)</td>
                <td className="text-right text-xs text-muted-foreground">TZS {approxTZS(registration.amount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payment details */}
          {payment && (
            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm print:bg-muted/30">
              <p className="font-semibold">Payment details</p>
              <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
                <span>Method: {payment.method}</span>
                <span>Status: {payment.status}</span>
                <span>Gateway: Selcom</span>
                {payment.selcomTransId && <span>Transaction: {payment.selcomTransId}</span>}
                {payment.paidAt && <span>Paid on: {formatDate(payment.paidAt)}</span>}
                <span>Reference: {payment.reference}</span>
              </div>
            </div>
          )}

          <p className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            Thank you for registering for {siteConfig.name}. This document was generated electronically and is valid without a signature.
            {!isPaid && " Payment is required to confirm your registration."}
          </p>
        </article>
      </div>
    </div>
  );
}
