import { redirect } from "next/navigation";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const code = typeof sParams.code === "string" ? sParams.code : undefined;

  if (code) {
    redirect(`/events/${slug}/ticket/${code}`);
  }

  redirect(`/events/${slug}`);
}
