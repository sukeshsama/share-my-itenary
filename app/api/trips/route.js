import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import Trip                 from "@/lib/models/Trip";

// GET /api/trips  — list trips for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const trips = await Trip.find({ userId: session.user.id }).sort({ startDate: -1 });
    return NextResponse.json(trips);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/trips  — create a trip for the authenticated user
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const trip = await Trip.create({ ...body, userId: session.user.id });
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
