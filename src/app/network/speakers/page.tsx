// src/app/network/speakers/page.tsx
import { getMentorSpeakerNetwork } from "@/server/speakers/service";
import { SpeakerNetworkClient } from "@/components/network/SpeakerNetworkClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor & Speaker Network | KailshiansX",
  description:
    "Connect with industry leaders, tech founders, and architects for 1:1 mentorship and chapter speaking engagements.",
};

export default async function SpeakersNetworkPage() {
  const { speakers, filterOptions } = await getMentorSpeakerNetwork();
  return <SpeakerNetworkClient initialSpeakers={speakers} filterOptions={filterOptions} />;
}
