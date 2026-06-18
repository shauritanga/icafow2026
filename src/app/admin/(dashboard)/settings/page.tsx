import { PageTitle } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <Stagger className="h-full">
      <div className="w-full space-y-8">
        <PageTitle title="Platform Settings" subtitle="Manage global platform configurations and security." />

      <SettingsForm defaultSettings={siteSettings} />

      <Card className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure how you receive alerts and summaries.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="space-y-1 pr-4">
              <h4 className="font-medium text-foreground">New Registrations</h4>
              <p className="text-sm text-muted-foreground">Receive an email when a new application is submitted.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <h4 className="font-medium text-foreground">Daily Summary</h4>
              <p className="text-sm text-muted-foreground">A daily digest of all payments and verifications.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage authentication and access policies.</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
            <div className="space-y-1 pr-4">
              <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Enable 2FA</Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <h4 className="font-medium text-foreground">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">Manage devices currently logged into this account.</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Sign out all devices</Button>
          </div>
        </div>
      </Card>
      </div>
    </Stagger>
  );
}
