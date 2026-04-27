import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";
import RequestsList from "@/components/RequestsList";

async function getHistory(clerkId: string) {
  await connectDB();
  
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  // Find my own listing IDs (to find requests received)
  const myListingIds = await Listing.find({ user: user._id }).distinct("_id");

  // Find requests where I am either the requester OR the target of a listing
  // AND status is completed or cancelled
  const requests = await ExchangeRequest.find({
    $or: [
      { requester: user._id },
      { listing: { $in: myListingIds } }
    ],
    status: { $in: ["completed", "cancelled"] }
  })
  .populate("requester", "name email phone neighborhood")
  .populate({
    path: "listing",
    populate: { path: "user", select: "name phone neighborhood rating reviewCount" }
  })
  .sort({ updatedAt: -1 });

  // Mark each request as "received" or "sent" for the frontend
  const enrichedRequests = requests.map(req => {
    const isReceived = myListingIds.some(id => id.toString() === req.listing?._id.toString());
    return {
      ...req.toObject(),
      isReceived,
      _id: req._id.toString(),
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    };
  });

  return enrichedRequests;
}

export default async function HistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    redirect("/onboarding");
  }

  const requests = await getHistory(userId);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Historique</h1>
        <p className="mt-2 text-sm text-slate-500">
          Retrouvez l&apos;ensemble de vos échanges passés, terminés ou annulés.
        </p>
      </section>

      <RequestsList initialRequests={requests as any} role={user.role} hideActions={true} />
    </div>
  );
}
