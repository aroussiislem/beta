import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { verifyPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.errors[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email ou mot de passe invalide",
          },
        },
        { status: 401 },
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_INACTIVE",
            message: "Ce compte utilisateur est inactif",
          },
        },
        { status: 403 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email ou mot de passe invalide",
          },
        },
        { status: 401 },
      );
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return success
    // Return success with cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      },
      { status: 200 },
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Une erreur est survenue lors de la connexion",
        },
      },
      { status: 500 },
    );
  }
}
