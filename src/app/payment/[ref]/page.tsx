import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PaymentStatus } from "@/components/payment/payment-status";
import { isSelcomMock } from "@/lib/selcom/config";
import { siteConfig } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: { index: false, follow: false },
};

export default async function PaymentPage(props: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await props.params;

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container-edge flex h-16 items-center">
          <Link href="/">
            <Image src="/assets/logo-icafow.png" alt={siteConfig.name} width={140} height={44} className="h-9 w-auto" priority />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <PaymentStatus reference={ref} mock={isSelcomMock} />
        </div>
      </main>
    </div>
  );
}
