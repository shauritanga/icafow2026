"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Trash2, Search, X, User, Mail, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { addAdminUser, deleteAdminUser } from "./actions";
import { toast } from "sonner";

export function UsersClient({ initialData }: { initialData: any[] }) {
  const [users, setUsers] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirm state
  const [userToDelete, setUserToDelete] = useState<{ id: string, email: string } | null>(null);

  const filteredUsers = users.filter((u) => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Use a fixed temporary password for all new admins
    const tempPassword = "ChangeMe123!";
    const result = await addAdminUser({ name, email, passwordHash: tempPassword, role });
    if (result.ok) {
      // Optimistic update
      setUsers([{
        id: Math.random().toString(), // temporary
        name,
        email,
        role,
        createdAt: new Date()
      }, ...users]);
      
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setRole("admin");
    } else {
      setError(result.error || "Something went wrong.");
    }
    setIsSubmitting(false);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    
    const result = await deleteAdminUser(userToDelete.id);
    if (result.ok) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success("Administrator removed successfully.");
    } else {
      toast.error(result.error || "Failed to delete user.");
    }
    setUserToDelete(null);
  };

  const handleDeleteUser = (id: string, userEmail: string) => {
    setUserToDelete({ id, email: userEmail });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Users</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage who has access to the ICAFoW dashboard.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 size-4" /> Add Administrator
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search admins by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {user.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        <Trash2 className="size-4 mr-2" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
            
            {/* Header */}
            <div className="relative bg-muted/30 px-6 py-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Add Administrator</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create a new dashboard account.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                  <ShieldAlert className="size-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="pl-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="pl-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role Access</label>
                  <select 
                    className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="admin">Admin (Full Access)</option>
                    <option value="staff">Staff (Limited Access)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                </div>
                
                <div className="mt-8 flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-6">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                    {isSubmitting ? "Creating..." : "Add User"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Remove Administrator"
        description={`Are you sure you want to permanently remove ${userToDelete?.email}? They will immediately lose access to the dashboard.`}
        onConfirm={executeDelete}
        confirmText="Remove User"
        variant="destructive"
      />
    </div>
  );
}
