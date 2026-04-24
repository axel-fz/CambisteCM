/**
 * lib/mongodb.ts
 * Cached Mongoose connection helper.
 * Uses a global cache so the connection is reused across hot-reloads in dev
 * and shared across serverless function invocations in production.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local file");
}

// Extend the NodeJS global type to cache the Mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global variable so the cache survives hot-reloads in development
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

/**
 * Connect to MongoDB. Returns the cached connection if already established.
 */
export async function connectDB(): Promise<typeof mongoose> {
  // If we already have a live connection, return it immediately
  if (cache.conn) return cache.conn;

  // If a connection attempt is in progress, wait for it
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
