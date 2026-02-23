import { NextResponse } from "next/server";
import bcrypt           from "bcryptjs";
import { connectDB }    from "@/lib/mongodb";
import User             from "@/lib/models/User";

// POST /api/auth/register
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email: email.toLowerCase(), password: hashed });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
