import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <Loader2 className="size-8 text-primary animate-spin" />
    </div>
  );
}
