// src/app/api/me/recommendations/route.ts
// Personalized event and community role recommendations endpoint

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonalizedRecommendations } from "@/server/recommendations/service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view recommendations." },
        { status: 401 }
      );
    }

    const recommendations = await getPersonalizedRecommendations(session.user.id);
    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Failed to generate personalized recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error fetching recommendations." },
      { status: 500 }
    );
  }
}
