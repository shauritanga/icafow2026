import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApplicationSuccess({
  title,
  reference,
  message,
  onClose,
}: {
  title: string;
  reference: string;
  message: string;
  /** When provided, renders a "Done" button that closes the modal instead of a home link. */
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <CheckCircle2 className="size-16 text-secondary" />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm">
        Reference: <span className="font-mono font-semibold text-primary">{reference}</span>
      </div>
      {onClose ? (
        <Button variant="outline" className="mt-2" onClick={onClose}>
          Done
        </Button>
      ) : (
        <Button asChild variant="outline" className="mt-2">
          <Link href="/">Back to home</Link>
        </Button>
      )}
    </div>
  );
}
