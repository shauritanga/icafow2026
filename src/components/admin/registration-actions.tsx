"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Trash2, CheckCircle, XCircle, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteRegistration, updateRegistration, updateRegistrationStatus } from "@/app/admin/actions";
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
  
  // Edit Form State
  const [formData, setFormData] = useState({
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone || "",
    organization: registration.organization || "",
  });
  const [isSaving, setIsSaving] = useState(false);

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
      await updateRegistration(registration.id, formData, pathname);
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

      {/* View/Edit Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Reference: <span className="font-mono text-foreground">{registration.reference}</span> • Status: <span className="text-foreground">{registration.status}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
