import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";
import RequestsList from "@/components/RequestsList";

async function getHistory(userId: string, role: string) {
  await connectDB();
  
  let requests;
  if (role === "changeur") {
    const myChangerProfiles = await Changer.find({ userId }).select("_id");
    const myChangerIds = myChangerProfiles.map((p) => p._id);

    requests = await ExchangeRequest.find({
      targetChangerId: { $in: myChangerIds },
      status: { $in: ["completed", "cancelled"] },
    }).sort({ updatedAt: -1 });
  } else {
    requests = await ExchangeRequest.find({
      requesterId: userId,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ updatedAt: -1 });
  }

  // Enrichment (Simplified for History)
  const targetIds = requests.map((r) => r.targetChangerId).filter(Boolean);
  const changers = await Changer.find({ _id: { $in: targetIds } }).lean();
  const changerMap = new Map(changers.map((c) => [String(c._id), c]));

  const requesterIds = requests.map((r) => r.requesterId);
  const requesters = await User.find({ clerkId: { $in: requesterIds } }).lean();
  const userMap = new Map(requesters.map((u) => [u.clerkId, u]));

  return requests.map((r) => ({
    ...r.toObject(),
    matchedChanger: r.targetChangerId ? changerMap.get(String(r.targetChangerId)) : null,
    requester: userMap.get(r.requesterId),
    createdAt: r.createdAt.toISOString(),
  }));
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

  const requests = await getHistory(userId, user.role);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Historique</h1>
        <p className="mt-2 text-sm text-slate-500">
          Retrouvez l&apos;ensemble de vos échanges passés, terminés ou annulés.
        </p>
      </section>

      <RequestsList initialRequests={requests} role={user.role} hideActions={true} />
    </div>
  );
}
