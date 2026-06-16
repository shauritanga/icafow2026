"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/forms/field";
import { ErrorBanner } from "@/components/forms/shared";
import { siteConfig } from "@/lib/content/site";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-gradient p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={150} height={48} className="h-11 w-auto" priority />
          <h1 className="mt-4 text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage ICAFoW 2026</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required placeholder="admin@icafow.org" autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password" required>
            <Input id="password" name="password" type="password" required placeholder="••••••••" autoComplete="current-password" />
          </Field>
          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}
