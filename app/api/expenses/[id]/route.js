import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";

// DELETE /api/expenses/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const expense = await Expense.findByIdAndDelete(params.id);
    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
