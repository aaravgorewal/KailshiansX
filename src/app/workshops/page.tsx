import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Hands-on technical workshops — MERN, Backend, DevOps, Cloud, AI, Blockchain and more from KailshiansX.",
};

export default function WorkshopsPage() {
  return (
    <PlaceholderPage
      badge="Workshops"
      title="Workshops"
      description="Hands-on technical workshops across MERN, Backend, DevOps, Cloud, AI, Blockchain and more. Host or request a workshop at your college."
    />
  );
}
