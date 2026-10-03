// src/app/admin/tech-talks/page.tsx
// Server component fetching TECH_TALK events and knowledge resources.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminTechTalksClient,
  type TechTalkListItem,
} from "@/components/admin/AdminTechTalksClient";
import { EventType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Tech Talks Manager | KailshiansX Admin",
};

export default async function AdminTechTalksPage() {
  await requireAdmin();

  const talks = await db.event.findMany({
    where: {
      type: EventType.TECH_TALK,
      deletedAt: null,
    },
    orderBy: { startDate: "desc" },
    include: {
      speakers: {
        include: {
          speaker: true,
        },
      },
      techTalkResource: true,
    },
  });

  const formatted: TechTalkListItem[] = talks.map((t) => {
    const primarySpeaker = t.speakers[0]?.speaker;
    const takeaways = Array.isArray(t.techTalkResource?.keyTakeaways)
      ? (t.techTalkResource.keyTakeaways as string[])
      : [];

    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      speakerName: primarySpeaker?.name ?? "TBA",
      speakerOrg: primarySpeaker?.organisation ?? null,
      startDate: t.startDate.toISOString(),
      slideUrl: t.techTalkResource?.slideUrl ?? null,
      videoUrl: t.techTalkResource?.videoUrl ?? null,
      repoUrl: t.techTalkResource?.repoUrl ?? null,
      keyTakeaways: takeaways,
      tags: t.techTalkResource?.tags ?? [],
    };
  });

  return <AdminTechTalksClient initialTalks={formatted} />;
}
