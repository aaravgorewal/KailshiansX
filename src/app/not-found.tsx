import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center sm:p-10">
        <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Error 404
        </span>
        <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/events">Explore Events</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
