"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markCheckedIn } from "@/app/admin/actions";
import { toast } from "sonner";

/** Staff-only "Check in" action shown on the verify page. */
export function CheckInButton({ token }: { token: string }) {
  const pathname = usePathname();
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const res = await markCheckedIn(token, pathname);
      if (!res.ok) {
        toast.error(res.error || "Could not check in");
        return;
      }
      setDone(true);
      toast.success(res.alreadyCheckedIn ? "Already checked in" : "Checked in ✓");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not check in");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary">
        <CheckCircle2 className="size-5" /> Checked in
      </p>
    );
  }

  return (
    <Button onClick={onClick} variant="green" size="lg" disabled={busy} className="w-full">
      {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
      Check in
    </Button>
  );
}
