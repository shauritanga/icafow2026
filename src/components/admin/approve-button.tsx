"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export function ApproveButton({ 
  id, 
  onApprove 
}: { 
  id: string, 
  onApprove: (id: string) => Promise<void> 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      await onApprove(id);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
          Approve
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 border-border shadow-2xl">
        <DialogHeader className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0 mb-4 ring-8 ring-primary/5">
            <AlertTriangle className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">Confirm Approval</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Are you sure you want to approve this application? This action will mark the registration as <strong className="font-medium text-foreground">CONFIRMED</strong>, and it will immediately become active on the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="w-full sm:w-auto font-medium">
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={loading} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium">
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
            {loading ? "Approving..." : "Yes, Approve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
