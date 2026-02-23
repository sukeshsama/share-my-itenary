import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";

// GET /api/trips  — list all trips
export async function GET() {
  try {
    await connectDB();
    const trips = await Trip.find({}).sort({ startDate: -1 });
    return NextResponse.json(trips);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/trips  — create a trip
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const trip = await Trip.create(body);
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
