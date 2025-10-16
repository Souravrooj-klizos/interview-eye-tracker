import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://souravrooj_db_user:oeP6tCbps8FekxoU@cluster0.wqgilyl.mongodb.net/interviewdb?retryWrites=true&w=majority";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("✅ Connected to MongoDB");
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
};
