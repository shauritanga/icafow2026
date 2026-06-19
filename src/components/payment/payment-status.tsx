"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Clock, RefreshCw, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { startPayment } from "@/lib/client/submit";

interface VerifyResponse {
  reference: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  amount: number;
  currency: string;
  registration: { reference: string; fullName: string; packageLabel?: string | null; type: string };
}

const statusMeta = {
  PAID: { icon: CheckCircle2, title: "Payment successful!", color: "text-secondary", badge: "green" as const },
  PENDING: { icon: Clock, title: "Awaiting payment", color: "text-gold", badge: "gold" as const },
  PROCESSING: { icon: Loader2, title: "Payment processing", color: "text-gold", badge: "gold" as const },
  FAILED: { icon: XCircle, title: "Payment failed", color: "text-destructive", badge: "default" as const },
  CANCELLED: { icon: XCircle, title: "Payment cancelled", color: "text-destructive", badge: "default" as const },
  REFUNDED: { icon: RefreshCw, title: "Payment refunded", color: "text-muted-foreground", badge: "outline" as const },
};

export function PaymentStatus({ reference, mock }: { reference: string; mock: boolean }) {
  const [data, setData] = React.useState<VerifyResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/payments/selcom/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load payment");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  React.useEffect(() => {
    // fetchStatus only updates state after an await, so this never triggers a
    // synchronous cascading render.
    const id = setTimeout(fetchStatus, 0);
    return () => clearTimeout(id);
  }, [fetchStatus]);

  // Poll while processing/pending (real gateway settles asynchronously).
  React.useEffect(() => {
    if (!data || data.status === "PAID" || data.status === "FAILED" || data.status === "CANCELLED") return;
    if (mock) return; // mock waits for the simulate buttons
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [data, mock, fetchStatus]);

  async function simulate(outcome: "success" | "fail") {
    setBusy(true);
    try {
      await fetch("/api/payments/mock-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, outcome }),
      });
      await fetchStatus();
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    setBusy(true);
    setError(null);
    try {
      await startPayment(reference);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retry");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        Loading payment status…
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="mx-auto size-12 text-destructive" />
        <h1 className="mt-3 text-xl font-bold">Payment not found</h1>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-5"><Link href="/">Back to home</Link></Button>
      </Card>
    );
  }

  const meta = statusMeta[data!.status];
  const Ico = meta.icon;
  const isPaid = data!.status === "PAID";
  const isFailed = data!.status === "FAILED" || data!.status === "CANCELLED";

  if (data!.amount === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-3 border-b border-border p-8 text-center">
          <CheckCircle2 className="size-16 text-primary" />
          <h1 className="text-2xl font-bold">Request Received</h1>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Thank you for your interest! Our team will review your application and contact you shortly to finalize the details.
          </p>
        </div>
        <div className="space-y-3 p-6 text-sm">
          <Row label="Reference" value={<span className="font-mono">{data!.reference}</span>} />
          <Row label="Name" value={data!.registration.fullName} />
          {data!.registration.packageLabel && <Row label="Package" value={data!.registration.packageLabel} />}
        </div>
        <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/"><ArrowLeft className="size-4" /> Back to home</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center gap-3 border-b border-border p-8 text-center">
        <Ico className={`size-16 ${meta.color} ${data!.status === "PROCESSING" ? "animate-spin" : ""}`} />
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <Badge variant={meta.badge}>{data!.status}</Badge>
      </div>

      <div className="space-y-3 p-6 text-sm">
        <Row label="Reference" value={<span className="font-mono">{data!.reference}</span>} />
        <Row label="Name" value={data!.registration.fullName} />
        {data!.registration.packageLabel && <Row label="Package" value={data!.registration.packageLabel} />}
        <Row label="Amount" value={<span className="font-bold text-primary">{formatCurrency(data!.amount, data!.currency)}</span>} />
      </div>

      {error && <p className="px-6 pb-2 text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row sm:justify-center">
        {isPaid && (
          <Button asChild variant="green" size="lg">
            <Link href={`/invoice/${reference}`}><FileText className="size-4" /> View Receipt &amp; Invoice</Link>
          </Button>
        )}
        {isFailed && (
          <Button onClick={retry} variant="gradient" size="lg" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Retry Payment
          </Button>
        )}
        <Button asChild variant="outline" size="lg">
          <Link href="/"><ArrowLeft className="size-4" /> Back to home</Link>
        </Button>
      </div>

      {mock && !isPaid && (
        <div className="border-t border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mock mode — simulate the Selcom result
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => simulate("success")} variant="green" disabled={busy}>Simulate Success</Button>
            <Button onClick={() => simulate("fail")} variant="outline" disabled={busy}>Simulate Failure</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
