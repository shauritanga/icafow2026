"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} variant="outline" className="print:hidden">
      <Printer className="size-4" /> Print / Save PDF
    </Button>
  );
}
