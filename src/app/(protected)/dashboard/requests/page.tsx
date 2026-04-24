/**
 * app/(protected)/dashboard/requests/page.tsx
 * Displays exchange requests created by the current user.
 */
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface MatchedChanger {
  _id: string;
  name: string;
  neighborhood: string;
  phone: string;
}

interface ExchangeRequestItem {
  _id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  status: "open" | "matched" | "completed" | "cancelled";
  createdAt: string;
  matchedChanger: MatchedChanger | null;
}

async function getRequests() {
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/exchange-requests`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    return [] as ExchangeRequestItem[];
  }

  return (await response.json()) as ExchangeRequestItem[];
}

const STATUS_STYLES = {
  open: "bg-amber-50 text-amber-700",
  matched: "bg-emerald-50 text-emerald-700",
  completed: "bg-sky-50 text-sky-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export default async function RequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const requests = await getRequests();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Mes demandes</h1>
        <p className="mt-2 text-sm text-slate-500">
          Suivez les demandes d&apos;échange que vous avez créées et les contacts débloqués.
        </p>
      </section>

      {requests.length === 0 ? (
        <section className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">
            receipt_long
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Aucune demande pour le moment
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Créez une demande depuis le tableau de bord pour commencer un échange.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {requests.map((request) => (
            <article
              key={request._id}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Demande
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-800">
                    {request.amount} {request.fromCurrency} vers {request.toCurrency}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-[#f7faf3] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Créée le
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(request.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Partenaire
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {request.matchedChanger?.name ?? "En attente"}
                  </p>
                </div>
              </div>

              {request.matchedChanger ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800">
                    Contact débloqué
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    {request.matchedChanger.neighborhood}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-800">
                    {request.matchedChanger.phone}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
