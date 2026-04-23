// src/app/api/seed/route.ts
// One-off endpoint to seed the database with initial data.

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // OPTIONAL: require a simple secret header for safety in dev
    const secret = req.headers.get("x-seed-secret");
    if (!secret || secret !== process.env.SEED_SECRET) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Clean existing data if you want a fresh start
    // Comment these out if you don't want to wipe collections
    await Promise.all([
      User.deleteMany({}),
      Changer.deleteMany({}),
      ExchangeRequest.deleteMany({})
    ]);

    // Seed users (example: one échangeur, one changeur)
    const users = await User.insertMany([
      {
        clerkId: "user_echangeur_demo",
        name: "Alice Mboa",
        email: "alice@example.com",
        role: "echangeur",
        neighborhood: "Bonapriso",
        phone: "+237690000001",
        onboardingComplete: true,
      },
      {
        clerkId: "user_changeur_demo",
        name: "Marc Djoum",
        email: "marc@example.com",
        role: "changeur",
        neighborhood: "Bastos",
        phone: "+237690000002",
        onboardingComplete: true,
      },
    ]);

    // Build initials helper
    const initialsOf = (name: string) =>
      name
        .split(" ")
        .map((p) => p[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");

    // Seed changers:
    // - some "changeur" entries (have currency to sell)
    // - some "echangeur" entries (have XAF to buy currency)
    const changers = await Changer.insertMany([
      {
        userId: users[1].clerkId,
        name: users[1].name,
        initials: initialsOf(users[1].name),
        neighborhood: users[1].neighborhood,
        role: users[1].role, // changeur
        currency: "EUR",
        rate: "655 XAF / EUR",
        status: "online",
        rating: 4.9,
        reviewCount: 67,
        phone: users[1].phone,
        isActive: true,
      },
      {
        userId: users[1].clerkId,
        name: users[1].name,
        initials: initialsOf(users[1].name),
        neighborhood: "Deido",
        role: users[1].role, // changeur
        currency: "USD",
        rate: "610 XAF / USD",
        status: "busy",
        rating: 4.7,
        reviewCount: 45,
        phone: users[1].phone,
        isActive: true,
      },
      {
        userId: users[0].clerkId,
        name: users[0].name,
        initials: initialsOf(users[0].name),
        neighborhood: users[0].neighborhood,
        role: users[0].role, // echangeur
        currency: "XAF",
        rate: "Demande 1 000 EUR",
        status: "online",
        rating: 4.6,
        reviewCount: 23,
        phone: users[0].phone,
        isActive: true,
      },
    ]);

    // Optional: seed some exchange requests
    const requests = await ExchangeRequest.insertMany([
      {
        requesterId: users[0].clerkId,
        targetChangerId: changers[0]._id.toString(),
        amount: 1500,
        fromCurrency: "XAF",
        toCurrency: "EUR",
        status: "open",
      },
      {
        requesterId: users[1].clerkId,
        amount: 800,
        fromCurrency: "EUR",
        toCurrency: "XAF",
        status: "open",
      },
    ]);

    return Response.json(
      {
        message: "Seed completed",
        users: users.length,
        changers: changers.length,
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