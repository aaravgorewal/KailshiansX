import { NextRequest, NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/server/payments/webhook";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const result = await processRazorpayWebhook({
      rawBody,
      signature,
    });

    return NextResponse.json(result.error ? { error: result.error } : { message: result.message }, {
      status: result.status,
    });
  } catch (error) {
    console.error("[Razorpay Webhook Route Error]:", error);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
