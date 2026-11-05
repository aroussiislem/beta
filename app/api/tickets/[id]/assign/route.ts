import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token || "");
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    // Only ADMIN and MANAGER can assign tickets
    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only admins and managers can assign tickets",
          },
        },
        { status: 403 },
      );
    }

    const { id } = params;
    const { assignedToId } = await request.json();

    if (!assignedToId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "assignedToId is required",
          },
        },
        { status: 400 },
      );
    }

    // Verify the assigned user exists and is a DEVELOPER
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (!assignedUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Assigned user not found" },
        },
        { status: 404 },
      );
    }

    if (assignedUser.role !== "DEVELOPER") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Can only assign tickets to developers",
          },
        },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        assignedToId,
        assignedAt: new Date(),
        status: "ASSIGNED",
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("[Assign Ticket Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to assign ticket" },
      },
      { status: 500 },
    );
  }
}
