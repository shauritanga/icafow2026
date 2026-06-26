"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, Eye, Trash2, CheckCircle, XCircle, Loader2, Edit, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteRegistration, updateRegistration, updateRegistrationStatus } from "@/app/admin/actions";
import { compressImage, MAX_ORIGINAL_BYTES, MAX_ENCODED_LENGTH } from "@/lib/client/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Registration } from "@prisma/client";
import { toast } from "sonner";

export function RegistrationRowActions({ registration }: { registration: Registration }) {
  const pathname = usePathname();
  const [openPopover, setOpenPopover] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  
  // Speakers carry a profile photo in details.photoData, which the public
  // site renders. Surface it in the edit form so admins can replace it.
  const isSpeaker = registration.type === "SPEAKER";
  const details =
    registration.details && typeof registration.details === "object" && !Array.isArray(registration.details)
      ? (registration.details as Record<string, unknown>)
      : {};
  const initialPhoto = (details.photoData as string | undefined) ?? null;

  // Edit Form State
  const [formData, setFormData] = useState({
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone || "",
    organization: registration.organization || "",
    jobTitle: registration.jobTitle || "",
    topic: (details.topic as string | undefined) || "",
  });
  const [photoData, setPhotoData] = useState<string | null>(initialPhoto);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoTouched, setPhotoTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (file.size > MAX_ORIGINAL_BYTES) {
      setPhotoError("Image is too large. Please choose a file under 25MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      if (compressed.length > MAX_ENCODED_LENGTH) {
        setPhotoError("Could not compress this image enough. Please try another photo.");
        return;
      }
      setPhotoData(compressed);
      setPhotoTouched(true);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Could not process the image.");
    }
  };

  // Status Actions
  const handleStatusChange = async (status: "CONFIRMED" | "CANCELLED") => {
    try {
      setOpenPopover(false);
      toast.promise(updateRegistrationStatus(registration.id, status, pathname), {
        loading: "Updating status...",
        success: "Status updated successfully!",
        error: "Failed to update status."
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    try {
      await deleteRegistration(registration.id, pathname);
      toast.success("Registration deleted.");
    } catch (e) {
      toast.error("Failed to delete registration.");
    }
  };

  // Update Action
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { topic, ...base } = formData;
      await updateRegistration(
        registration.id,
        {
          ...base,
          // Talk topic lives in details.topic and only applies to speakers.
          ...(isSpeaker ? { topic } : {}),
          // Only send the photo when the admin actually changed it.
          ...(isSpeaker && photoTouched && photoData ? { photoData } : {}),
        },
        pathname
      );
      toast.success("Registration updated.");
      setOpenModal(false);
    } catch (e) {
      toast.error("Failed to update registration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <MoreHorizontal className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1">
          {registration.status === "PENDING" && (
            <>
              <Button variant="ghost" size="sm" className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => { setOpenPopover(false); setOpenApprove(true); }}>
                <CheckCircle className="mr-2 size-4" /> Approve
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => { setOpenPopover(false); setOpenReject(true); }}>
                <XCircle className="mr-2 size-4" /> Reject
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setOpenPopover(false)}>
            <Link href={`/admin/registrations/${registration.id}`}>
              <Eye className="mr-2 size-4 text-muted-foreground" /> View Details
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setOpenPopover(false); setOpenModal(true); }}>
            <Edit className="mr-2 size-4 text-muted-foreground" /> Quick Edit
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { setOpenPopover(false); setOpenDelete(true); }}>
            <Trash2 className="mr-2 size-4" /> Delete
          </Button>
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Registration"
        description="Are you sure you want to delete this registration? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Delete"
      />

      {/* Approve Confirmation */}
      <ConfirmDialog
        open={openApprove}
        onOpenChange={setOpenApprove}
        title="Approve Registration"
        description="Are you sure you want to approve this registration? The applicant will be notified."
        onConfirm={() => handleStatusChange("CONFIRMED")}
        confirmText="Approve"
      />

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={openReject}
        onOpenChange={setOpenReject}
        title="Reject Registration"
        description="Are you sure you want to reject this registration? The applicant will be notified."
        onConfirm={() => handleStatusChange("CANCELLED")}
        variant="destructive"
        confirmText="Reject"
      />

      {/* Edit Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="space-y-1 border-b px-6 py-5">
            <DialogTitle className="text-lg">Edit registration</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-foreground/80">{registration.reference}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="capitalize">{registration.type.toLowerCase()}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-foreground/80">{registration.status}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            {isSpeaker && (
              <div className="flex items-center gap-5 rounded-xl border bg-muted/30 p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted">
                  {photoData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoData} alt="Speaker" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <User className="size-8" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium">Profile photo</p>
                    <p className="text-xs text-muted-foreground">Shown on the public speakers page. We resize it for you.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="mr-2 size-4" /> {photoData ? "Change photo" : "Upload photo"}
                    </Button>
                  </div>
                  {photoError && <p className="text-xs font-medium text-destructive">{photoError}</p>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="re-fullName">Full name</Label>
                <Input id="re-fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re-email">Email</Label>
                <Input id="re-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re-phone">Phone</Label>
                <Input id="re-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re-organization">Organization</Label>
                <Input id="re-organization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re-jobTitle">Job title</Label>
                <Input id="re-jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
              </div>
              {isSpeaker && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="re-topic">Talk topic / title</Label>
                  <Input id="re-topic" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} placeholder="Proposed talk title" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
