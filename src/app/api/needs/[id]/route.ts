import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Need from "@/models/Need";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    await connectDB();
    const need = await Need.findOneAndUpdate(
      { _id: id, userId },
      {
        currency: body.currency,
        amount: body.rate || body.amount,
        neighborhood: body.neighborhood,
        phone: body.phone,
        status: body.status,
        isActive: body.isActive,
      },
      { new: true }
    );

    if (!need) return Response.json({ error: "Need not found" }, { status: 404 });
    return Response.json(need);
  } catch (error) {
    return Response.json({ error: "Failed to update need" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const result = await Need.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) return Response.json({ error: "Need not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete need" }, { status: 500 });
  }
}
