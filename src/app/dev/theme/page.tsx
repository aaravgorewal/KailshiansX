import { notFound } from "next/navigation";
import { ThemePreviewClient } from "./ThemePreviewClient";

export const metadata = {
  title: "Design Tokens & Theme Review | Dev",
};

export default function ThemeDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ThemePreviewClient />;
}
