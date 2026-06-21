"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markCheckedIn } from "@/app/admin/actions";
import { toast } from "sonner";

/** Staff-only "check in next person" action (N-of-M) shown on the verify page. */
export function CheckInButton({
  token,
  seats,
  checkedInCount,
}: {
  token: string;
  seats: number;
  checkedInCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = React.useState(false);

  const multi = seats > 1;
  const remaining = Math.max(seats - checkedInCount, 0);

  async function onClick() {
    setBusy(true);
    try {
      const res = await markCheckedIn(token, pathname);
      if (!res.ok) {
        toast.error(res.error || "Could not check in");
        return;
      }
      if (!res.incremented) {
        toast.message("Everyone on this registration is already checked in");
      } else {
        toast.success(
          multi ? `Checked in ${res.checkedInCount} of ${res.seats}` : "Checked in ✓"
        );
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not check in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={onClick} variant="green" size="lg" disabled={busy} className="w-full">
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : multi ? (
        <UserPlus className="size-4" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      {multi ? `Check in next person (${remaining} left)` : "Check in"}
    </Button>
  );
}
