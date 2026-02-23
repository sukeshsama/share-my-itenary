import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";
import Expense from "@/lib/models/Expense";

// GET /api/trips/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const trip = await Trip.findById(params.id);
    if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(trip);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/trips/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const trip = await Trip.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(trip);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE /api/trips/:id  (also removes all expenses for that trip)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await Expense.deleteMany({ tripId: params.id });
    const trip = await Trip.findByIdAndDelete(params.id);
    if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
