import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import Trip                 from "@/lib/models/Trip";
import Expense              from "@/lib/models/Expense";

async function ownsTrip(session, tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: "Trip not found", status: 404 };
  if (trip.userId.toString() !== session.user.id)
    return { error: "Forbidden", status: 403 };
  return {};
}

// GET /api/trips/:id/expenses
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { error, status } = await ownsTrip(session, params.id);
    if (error) return NextResponse.json({ error }, { status });

    const expenses = await Expense.find({ tripId: params.id }).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/trips/:id/expenses
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { error, status } = await ownsTrip(session, params.id);
    if (error) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const expense = await Expense.create({ ...body, tripId: params.id });
    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
