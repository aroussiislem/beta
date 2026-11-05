import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid token" },
        },
        { status: 401 },
      );
    }

    const { id } = params;

    // Role-based access control
    // ADMIN and MANAGER can view all users
    // Other users can only view their own profile
    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";
    const isSelf = decoded.userId === id;

    if (!isAdmin && !isManager && !isSelf) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view this user",
          },
        },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        address: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("[Get User Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch user" },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify token
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "No token provided" },
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
            message: "Only admins and managers can update users",
          },
        },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = updateUserSchema.safeParse(body);
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

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        },
        { status: 404 },
      );
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        address: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[Update User Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update user" },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify token
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "No token provided" },
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
            message: "Only admins and managers can delete users",
          },
        },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        },
        { status: 404 },
      );
    }

    // Delete user (will cascade delete related records)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[Delete User Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete user" },
      },
      { status: 500 },
    );
  }
}
