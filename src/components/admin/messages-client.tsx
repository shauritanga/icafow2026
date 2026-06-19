"use client";

import { useState } from "react";
import { ContactMessage } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trash2, Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteContactMessage, replyToContactMessage } from "@/app/admin/actions";
import { toast } from "sonner";

export function MessagesClient({ messages }: { messages: ContactMessage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id || null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Re-find the message from the updated prop list to ensure data is fresh
  const selectedMessage = messages.find((m) => m.id === selectedId);

  async function handleDelete() {
    if (!selectedMessage) return;
    setIsDeleting(true);
    try {
      await deleteContactMessage(selectedMessage.id);
      toast.success("Message deleted");
      setSelectedId(null);
      setDeleteDialogOpen(false);
    } catch (e) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReply() {
    if (!selectedMessage || !replyText.trim()) return;
    setIsReplying(true);
    try {
      await replyToContactMessage(selectedMessage.id, replyText);
      toast.success("Reply sent successfully via email");
      setReplyText("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-border bg-background shadow-sm text-center p-8">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Send className="h-10 w-10 text-muted-foreground opacity-40" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your Inbox is Empty</h2>
        <p className="text-muted-foreground max-w-sm">
          When visitors reach out to you through the website's contact form, their messages will appear here.
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
          selectedMessage ? "hidden w-full lg:flex lg:w-[350px] shrink-0" : "w-full"
        )}
      >
        <div className="border-b border-border p-4 bg-muted/20 shrink-0">
          <h2 className="font-semibold text-lg">Inbox ({messages.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
          {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  "w-full flex flex-col items-start gap-1 rounded-lg p-3 text-left transition-colors hover:bg-muted/50",
                  selectedId === m.id ? "bg-primary/10 border-primary/20 shadow-sm" : "border-transparent"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{m.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDate(m.createdAt, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className="text-xs font-medium truncate w-full">{m.subject}</span>
                <span className="text-xs text-muted-foreground line-clamp-2 w-full">{m.message}</span>
              </button>
            ))
          }
        </div>
      </div>

      {/* Right Column: Detail */}
      <div
        className={cn(
          "flex-1 flex-col h-full bg-background relative min-w-0 min-h-0",
          selectedMessage ? "flex" : "hidden lg:flex"
        )}
      >
        {selectedMessage ? (
          <>
            {/* Detail Header */}
            <div className="flex items-start justify-between border-b border-border p-4 shrink-0 bg-background/50 backdrop-blur-sm z-10">
              <div className="flex items-start gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-xl leading-none truncate mb-1">{selectedMessage.subject}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-foreground truncate">{selectedMessage.name}</span>
                    <span className="text-muted-foreground truncate">&lt;{selectedMessage.email}&gt;</span>
                  </div>
                  {(selectedMessage.phone || selectedMessage.organization) && (
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/80">
                      {selectedMessage.phone && <span className="truncate">Phone: {selectedMessage.phone}</span>}
                      {selectedMessage.organization && <span className="truncate">Org: {selectedMessage.organization}</span>}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground/70 font-medium">
                    {formatDate(selectedMessage.createdAt, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
              {selectedMessage.message}
            </div>

            {/* Detail Footer: Reply */}
            <div className="border-t border-border/50 bg-background/50 p-4 shrink-0">
              <div className="flex items-end gap-3 w-full">
                <div className="relative flex-1">
                  <Textarea 
                    placeholder={`Reply to ${selectedMessage.name}... (sends directly to their email)`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[52px] max-h-[200px] w-full resize-none rounded-md bg-muted/30 border-border/50 focus-visible:bg-background focus-visible:ring-primary/50 py-3.5 px-4 text-sm transition-all shadow-sm"
                  />
                </div>
                <Button 
                  onClick={handleReply} 
                  disabled={isReplying || !replyText.trim()} 
                  size="icon"
                  className="h-[52px] w-[52px] rounded-md shrink-0 shadow-sm"
                >
                  {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                </Button>
              </div>
            </div>

            <ConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              title="Delete Message"
              description="Are you sure you want to permanently delete this message?"
              onConfirm={handleDelete}
              variant="destructive"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/5">
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-5">
              <Send className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No Message Selected</h3>
            <p className="text-sm">Select a message from the list to read and reply</p>
          </div>
        )}
      </div>
    </div>
  );
}
