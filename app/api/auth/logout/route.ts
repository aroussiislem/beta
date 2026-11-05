import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 },
  );

  // Clear HTTP-only cookie
  response.cookies.set({
    name: "authToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}
