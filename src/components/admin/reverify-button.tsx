"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reverifyPayment } from "@/app/admin/actions";
import { toast } from "sonner";

/** Admin "re-check with Selcom" action for a single payment. */
export function ReverifyButton({ reference }: { reference: string }) {
  const pathname = usePathname();
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const res = await reverifyPayment(reference, pathname);
      toast.success(`Re-checked with Selcom: ${res.status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to re-verify");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={busy}
      title="Re-check this payment's status with Selcom"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
    </Button>
  );
}
