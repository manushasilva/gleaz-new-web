import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "@/lib/storeData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = String(body?.fullName || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const address = String(body?.address || "").trim();
    const password = String(body?.password || "");
    const username = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || email.split("@")[0] || "user";

    if (!fullName || !email || !phone || !address || !password) {
      return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username,
      fullName,
      email,
      phone,
      address,
      passwordHash,
      role: "user",
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;

    return NextResponse.json(
      { user: safeUser, message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to create account right now." },
      { status: 500 }
    );
  }
}
