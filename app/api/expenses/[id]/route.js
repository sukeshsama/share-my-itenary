import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import Trip                 from "@/lib/models/Trip";
import Expense              from "@/lib/models/Expense";

// DELETE /api/expenses/:id
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const expense = await Expense.findById(params.id);
    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify the expense's parent trip belongs to this user
    const trip = await Trip.findById(expense.tripId);
    if (!trip || trip.userId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await expense.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
