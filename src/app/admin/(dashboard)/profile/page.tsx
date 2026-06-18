import { PageTitle } from "@/components/admin/ui";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const email = session?.user?.email || "admin@icafow.com";
  
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  return (
    <Stagger className="h-full">
      <div className="w-full space-y-8">
        <PageTitle title="My Profile" subtitle="Manage your account settings and preferences." />

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-3">
            <ProfileForm 
              defaultName={user?.name || ""} 
              defaultEmail={email} 
              defaultPhone={user?.phone || ""}
              defaultAvatar={user?.avatarData || ""}
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 space-y-6 border-destructive/20 bg-destructive/5">
              <div>
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-1">Irreversible actions for your account.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1">Permanently remove your account and all data.</p>
                </div>
                <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Stagger>
  );
}
