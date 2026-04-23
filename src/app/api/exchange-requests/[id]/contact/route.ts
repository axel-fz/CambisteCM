/**
 * app/api/exchange-requests/[id]/contact/route.ts
 * Marks an exchange request as matched and returns the selected changer contact.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetChangerId } = (await req.json()) as { targetChangerId?: string };
  if (!targetChangerId) {
    return Response.json(
      { error: "targetChangerId is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const { id } = await context.params;
    const exchangeRequest = await ExchangeRequest.findById(id);

    if (!exchangeRequest) {
      return Response.json(
        { error: "Exchange request not found" },
        { status: 404 }
      );
    }

    if (exchangeRequest.requesterId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const changer = await Changer.findById(targetChangerId);
    if (!changer) {
      return Response.json({ error: "Changer not found" }, { status: 404 });
    }

    exchangeRequest.status = "matched";
    exchangeRequest.targetChangerId = targetChangerId;
    await exchangeRequest.save();

    return Response.json({
      request: exchangeRequest,
      phone: changer.phone,
    });
  } catch (error) {
    console.error("POST /api/exchange-requests/[id]/contact failed", error);
    return Response.json(
      { error: "Failed to connect both parties" },
      { status: 500 }
    );
  }
}
