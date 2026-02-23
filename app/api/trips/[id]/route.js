import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import Trip                 from "@/lib/models/Trip";
import Expense              from "@/lib/models/Expense";

async function ownsTrip(session, tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) return { trip: null, error: "Not found", status: 404 };
  if (trip.userId.toString() !== session.user.id)
    return { trip: null, error: "Forbidden", status: 403 };
  return { trip };
}

// GET /api/trips/:id
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { trip, error, status } = await ownsTrip(session, params.id);
    if (error) return NextResponse.json({ error }, { status });
    return NextResponse.json(trip);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/trips/:id
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { error, status } = await ownsTrip(session, params.id);
    if (error) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const trip = await Trip.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    return NextResponse.json(trip);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE /api/trips/:id  (also removes all expenses)
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { error, status } = await ownsTrip(session, params.id);
    if (error) return NextResponse.json({ error }, { status });

    await Expense.deleteMany({ tripId: params.id });
    await Trip.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
