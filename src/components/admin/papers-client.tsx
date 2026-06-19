"use client";

import { useState } from "react";
import { Paper, Registration } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FileText, ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updatePaperStatus } from "@/app/admin/actions";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui";

type PaperWithReg = Paper & { registration: Registration };

export function PapersClient({ papers }: { papers: PaperWithReg[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(papers[0]?.id || null);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedPaper = papers.find((p) => p.id === selectedId);

  async function handleStatusChange(newStatus: string) {
    if (!selectedPaper) return;
    setIsUpdating(true);
    try {
      await updatePaperStatus(selectedPaper.id, newStatus);
      toast.success("Paper status updated successfully");
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  }

  if (papers.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-border bg-background shadow-sm text-center p-8">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Papers Submitted</h2>
        <p className="text-muted-foreground max-w-sm">
          When researchers submit their papers for review, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {/* Left Column: List */}
      <div
        className={cn(
          "flex h-full flex-col border-r border-border bg-muted/10 transition-all",
          selectedPaper ? "hidden w-full lg:flex lg:w-[380px] shrink-0" : "w-full"
        )}
      >
        <div className="border-b border-border p-4 bg-muted/20 shrink-0">
          <h2 className="font-semibold text-lg">Submissions ({papers.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
          {papers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "w-full flex flex-col items-start gap-1 rounded-xl p-4 text-left transition-all hover:bg-muted/50 border",
                selectedId === p.id ? "bg-primary/5 border-primary/20 shadow-sm" : "border-transparent"
              )}
            >
              <span className="font-semibold text-[15px] leading-snug line-clamp-2 mb-1">{p.title}</span>
              <span className="text-[13px] text-muted-foreground truncate w-full mb-3">{p.registration.fullName}</span>
              
              <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-border/40">
                <StatusBadge status={p.status.toUpperCase()} />
                <span className="text-[11px] font-medium text-muted-foreground/70 shrink-0 uppercase tracking-wider">
                  {formatDate(p.createdAt, { month: "short", day: "numeric" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Detail */}
      <div
        className={cn(
          "flex-1 flex-col h-full bg-background relative min-w-0 min-h-0",
          selectedPaper ? "flex" : "hidden lg:flex"
        )}
      >
        {selectedPaper ? (
          <>
            {/* Detail Header & Actions */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-border p-6 md:p-8 shrink-0 bg-background/50 backdrop-blur-sm z-10">
              <div className="flex items-start gap-5 flex-1">
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="min-w-0 pr-4">
                  <h2 className="font-display font-bold text-2xl leading-tight mb-3 tracking-tight">{selectedPaper.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">{selectedPaper.registration.fullName}</span>
                    <span>{selectedPaper.registration.email}</span>
                  </div>
                  {selectedPaper.track && (
                    <div className="inline-flex items-center rounded-md bg-secondary/80 px-2.5 py-1 text-[13px] font-medium text-secondary-foreground border border-border/50">
                      Track: <span className="font-semibold ml-1">{selectedPaper.track}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex flex-col items-end gap-3 shrink-0 bg-muted/20 p-4 rounded-xl border border-border/50 w-full md:w-auto">
                <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                  <div className="relative flex items-center gap-2">
                    <Select 
                      value={selectedPaper.status} 
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdating}
                      className="h-9 text-sm font-semibold w-[150px] shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground absolute -right-6" />}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-border/50 my-1 block md:hidden"></div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full mt-1">
                  {selectedPaper.fileUrl ? (
                    <Button asChild variant="default" className="gap-2 shadow-sm w-full md:w-[150px] font-semibold">
                      <a href={selectedPaper.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    </Button>
                  ) : (
                    <span className="text-[13px] text-muted-foreground italic py-2 md:py-0 w-full text-center md:text-right">No file attached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-10 space-y-12">
              <section className="max-w-3xl">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-border block"></span>
                  Abstract
                </h3>
                <div className="whitespace-pre-wrap text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 pl-6 border-l-[3px] border-primary/20">
                  {selectedPaper.abstract}
                </div>
              </section>

              {selectedPaper.keywords && (
                <section className="max-w-3xl">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 flex items-center gap-3">
                    <span className="w-6 h-[1px] bg-border block"></span>
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2.5 pl-6">
                    {selectedPaper.keywords.split(',').map((kw, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-muted/50 text-foreground text-[13px] font-medium rounded-lg border border-border/80 shadow-sm">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/5">
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-5">
              <FileText className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No Paper Selected</h3>
            <p className="text-sm">Select a paper from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
