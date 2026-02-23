import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";

// GET /api/trips/:id/expenses
export async function GET(request, { params }) {
  try {
    await connectDB();
    const expenses = await Expense.find({ tripId: params.id }).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/trips/:id/expenses
export async function POST(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const expense = await Expense.create({ ...body, tripId: params.id });
    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
