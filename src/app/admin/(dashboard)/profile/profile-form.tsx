"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/admin/actions";
import { Camera } from "lucide-react";

export function ProfileForm({
  defaultName,
  defaultEmail,
  defaultPhone,
  defaultAvatar,
}: {
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultAvatar: string;
}) {
  const [name, setName] = React.useState(defaultName);
  const [phone, setPhone] = React.useState(defaultPhone);
  const [avatarData, setAvatarData] = React.useState(defaultAvatar);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, phone, avatarData });
      alert("Profile updated successfully!");
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your name, phone, and avatar.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative group size-24 shrink-0 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center">
          {avatarData ? (
            <img src={avatarData} alt="Avatar" className="size-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">{defaultEmail.charAt(0).toUpperCase()}</span>
          )}
          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
            <Camera className="size-6" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2 flex-1 w-full">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Full Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Jane Doe" className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address (Read-only)</Label>
            <Input id="email" type="email" defaultValue={defaultEmail} disabled className="bg-muted/50 opacity-60" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 123 456 789" className="bg-muted/50 max-w-sm" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}
