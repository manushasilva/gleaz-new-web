import { NextRequest, NextResponse } from "next/server";
import { deleteUserSession } from "@/lib/storeData";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("gleaz-session")?.value;
    if (token) await deleteUserSession(token);

    const response = NextResponse.json({ success: true });
    response.cookies.set("gleaz-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Unable to end sign-in session:", error);
    return NextResponse.json({ error: "Unable to sign out." }, { status: 500 });
  }
}
