import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ensureDefaultAdminUser, getUserByIdentifier } from "@/lib/storeData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body?.username || body?.email || "").trim();
    const password = String(body?.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ error: "Username/email and password are required." }, { status: 400 });
    }

    await ensureDefaultAdminUser();

    const user = await getUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: "Invalid email/username or password." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email/username or password." }, { status: 401 });
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, message: "Signed in successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
