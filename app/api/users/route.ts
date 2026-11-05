import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentification requise" },
        },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Jeton invalide" },
        },
        { status: 401 },
      );
    }

    // Only ADMIN and MANAGER can list users
    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Seuls les administrateurs et les managers peuvent lister les utilisateurs",
          },
        },
        { status: 403 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Get Users Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la récupération des utilisateurs",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Aucun jeton fourni" },
        },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Seuls les administrateurs et les managers peuvent créer des utilisateurs",
          },
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const validation = createUserSchema.safeParse(body);
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

    const { name, email, password, role, phone, company, address } =
      validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "Un utilisateur avec cet email existe déjà",
          },
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        company,
        address,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        company: true,
        address: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Create User Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la création de l'utilisateur",
        },
      },
      { status: 500 },
    );
  }
}
