import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserById, updateUserProfile } from "@/lib/storeData";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body?.userId || "").trim();
    const username = String(body?.username || "").trim();
    const fullName = String(body?.fullName || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const address = String(body?.address || "").trim();

    if (!userId || !username || !fullName || !email || !phone || !address) {
      return NextResponse.json({ error: "Please complete all profile fields." }, { status: 400 });
    }

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const emailOwner = await getUserByEmail(email);
    if (emailOwner && emailOwner.id !== userId) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }

    const updatedUser = await updateUserProfile(userId, {
      username,
      fullName,
      email,
      phone,
      address,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Unable to update profile." }, { status: 400 });
    }

    const { passwordHash: _passwordHash, ...safeUser } = updatedUser;

    return NextResponse.json({ user: safeUser, message: "Profile updated successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to update profile right now." },
      { status: 500 }
    );
  }
}
