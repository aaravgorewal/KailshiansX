// src/app/verify/page.tsx
// Public Certificate Verification Portal ()
// Enter certificate ID or email/registration ID -> verify -> view -> download.

import type { Metadata } from "next";
import { verifyCertificate } from "@/server/certificates/service";
import {
  PublicVerifyClient,
  type VerifiedCertificateData,
} from "@/components/certificates/PublicVerifyClient";

interface Props {
  searchParams: Promise<{ id?: string; q?: string; code?: string; email?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const query = params.id || params.q || params.code || params.email;

  if (query) {
    const cert = await verifyCertificate(query);
    if (cert) {
      return {
        title: `Verified: ${cert.participantName} • ${cert.event.title} | KailshiansX Credential`,
        description: `Official Certificate of Excellence issued to ${cert.participantName} for ${cert.event.title}. Cryptographically verified by KailshiansX.`,
        openGraph: {
          title: `Verified Certificate: ${cert.participantName} (${cert.uniqueId})`,
          description: `Verified attendance and excellence in ${cert.event.title}.`,
          type: "website",
        },
      };
    }
  }

  return {
    title: "Verify Certificate & Developer Credential | KailshiansX",
    description:
      "Verify the authenticity of digital certificates issued by KailshiansX for hackathons, technical workshops, and developer meetups.",
  };
}

export default async function CertificateVerificationPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQuery = params.id || params.q || params.code || params.email || "";

  let initialCertificate: VerifiedCertificateData | null = null;
  if (initialQuery) {
    initialCertificate = (await verifyCertificate(
      initialQuery
    )) as unknown as VerifiedCertificateData;
  }

  return (
    <main className="bg-background min-h-screen px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      <PublicVerifyClient initialQuery={initialQuery} initialCertificate={initialCertificate} />
    </main>
  );
}
