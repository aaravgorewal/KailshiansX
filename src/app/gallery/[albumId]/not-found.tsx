// src/app/gallery/[albumId]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AlbumNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
        404 Not Found
      </p>
      <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Album Not Found
      </h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        This gallery album may have been archived or does not exist.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/gallery">Back to Gallery</Link>
        </Button>
      </div>
    </div>
  );
}
