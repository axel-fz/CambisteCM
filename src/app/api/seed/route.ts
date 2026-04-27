import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const secret = req.headers.get("x-seed-secret");
    if (!secret || secret !== process.env.SEED_SECRET) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      ExchangeRequest.deleteMany({})
    ]);

    const users = await User.insertMany([
      {
        clerkId: "user_echangeur_demo",
        name: "Alice Mboa",
        email: "alice@example.com",
        role: "echangeur",
        neighborhood: "Bonapriso",
        phone: "+237690000001",
        onboardingComplete: true,
        rating: 4.6,
        reviewCount: 23,
      },
      {
        clerkId: "user_changeur_demo",
        name: "Marc Djoum",
        email: "marc@example.com",
        role: "changeur",
        neighborhood: "Bastos",
        phone: "+237690000002",
        onboardingComplete: true,
        rating: 4.8,
        reviewCount: 112,
      },
    ]);

    const listings = await Listing.insertMany([
      {
        user: users[1]._id,
        type: "OFFER",
        currency: "EUR",
        rate: 655,
        neighborhood: "Bastos",
        phone: users[1].phone,
        status: "online",
        rating: 4.8,
        reviewCount: 112,
        isActive: true,
      },
      {
        user: users[1]._id,
        type: "OFFER",
        currency: "USD",
        rate: 610,
        neighborhood: "Deido",
        phone: users[1].phone,
        status: "busy",
        rating: 4.8,
        reviewCount: 112,
        isActive: true,
      },
      {
        user: users[0]._id,
        type: "NEED",
        currency: "EUR",
        amount: 1000,
        neighborhood: "Bonapriso",
        phone: users[0].phone,
        status: "online",
        rating: 4.6,
        reviewCount: 23,
        isActive: true,
      },
    ]);

    const requests = await ExchangeRequest.insertMany([
      {
        requester: users[0]._id,
        listing: listings[0]._id,
        amount: 1500,
        fromCurrency: "XAF",
        toCurrency: "EUR",
        status: "open",
      },
    ]);

    return Response.json(
      {
        message: "Seed completed",
        users: users.length,
        listings: listings.length,
        exchangeRequests: requests.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error seeding database:", err);
    return Response.json(
      { error: "Seed failed" },
      { status: 500 }
    );
  }
}