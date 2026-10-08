import type { Metadata } from "next";
import { PartnerForm } from "./PartnerForm";

export const metadata: Metadata = {
  title: "Partner with us | KailshiansX",
  description:
    "Collaborate with KailshiansX to host hackathons and tech meetups, offer campus venues, engage developer communities, or sponsor flagship initiatives across India.",
};

export default function PartnerPage() {
  return (
    <main className="container-page min-h-[70vh] py-16 sm:py-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-5xl">
            Partner with us
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Collaborate with KailshiansX to host hackathons and tech meetups, offer campus venues,
            engage developer communities, or sponsor flagship initiatives across India.
          </p>
        </header>

        <PartnerForm />
      </div>
    </main>
  );
}
