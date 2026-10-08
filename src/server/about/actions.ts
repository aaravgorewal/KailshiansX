"use server";

import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/server/security/rate-limit";
import { type AboutRoleApplicationInput } from "@/lib/validations/team-application";
import { submitAboutRoleApplication } from "@/server/applications/team";

export async function submitAboutRoleApplicationAction(rawInput: AboutRoleApplicationInput) {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rateLimit = await checkRateLimit(ip, "form");
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many submissions. Please wait a few moments before trying again.",
      };
    }
  } catch (err) {
    console.error("Rate limit check error:", err);
  }

  return submitAboutRoleApplication(rawInput);
}
