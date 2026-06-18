"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateSiteSettings } from "@/app/admin/actions";

export function SettingsForm({ defaultSettings }: { defaultSettings: any }) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    contact: {
      email: defaultSettings.contact?.email || "",
      phone: defaultSettings.contact?.phone || "",
      address: defaultSettings.contact?.address || "",
      poBox: defaultSettings.contact?.poBox || "",
      hours: defaultSettings.contact?.hours || "",
    },
    socials: {
      linkedin: defaultSettings.socials?.linkedin || "",
      twitter: defaultSettings.socials?.twitter || "",
      facebook: defaultSettings.socials?.facebook || "",
      instagram: defaultSettings.socials?.instagram || "",
      youtube: defaultSettings.socials?.youtube || "",
    }
  });

  const handleChange = (section: 'contact' | 'socials', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSiteSettings(formData);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
          <p className="text-sm text-muted-foreground mt-1">Displayed in the website footer and contact sections.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email Address</Label>
            <Input id="contact-email" value={formData.contact.email} onChange={e => handleChange('contact', 'email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone Number</Label>
            <Input id="contact-phone" value={formData.contact.phone} onChange={e => handleChange('contact', 'phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-address">Physical Address</Label>
            <Input id="contact-address" value={formData.contact.address} onChange={e => handleChange('contact', 'address', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-poBox">P.O. Box</Label>
            <Input id="contact-poBox" value={formData.contact.poBox} onChange={e => handleChange('contact', 'poBox', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contact-hours">Working Hours</Label>
            <Input id="contact-hours" value={formData.contact.hours} onChange={e => handleChange('contact', 'hours', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Social Networks</h3>
          <p className="text-sm text-muted-foreground mt-1">Links to your official social media profiles.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="social-linkedin">LinkedIn URL</Label>
            <Input id="social-linkedin" value={formData.socials.linkedin} onChange={e => handleChange('socials', 'linkedin', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-twitter">Twitter / X URL</Label>
            <Input id="social-twitter" value={formData.socials.twitter} onChange={e => handleChange('socials', 'twitter', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-facebook">Facebook URL</Label>
            <Input id="social-facebook" value={formData.socials.facebook} onChange={e => handleChange('socials', 'facebook', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-instagram">Instagram URL</Label>
            <Input id="social-instagram" value={formData.socials.instagram} onChange={e => handleChange('socials', 'instagram', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="social-youtube">YouTube URL</Label>
            <Input id="social-youtube" value={formData.socials.youtube} onChange={e => handleChange('socials', 'youtube', e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Saving..." : "Save Website Data"}
          </Button>
        </div>
      </Card>
    </>
  );
}
