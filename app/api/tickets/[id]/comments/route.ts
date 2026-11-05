import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify authentication
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

    const { id } = params;

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Ticket not found" },
        },
        { status: 404 },
      );
    }

    // Role-based access control
    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";
    const isAssigned = ticket.assignedToId === decoded.userId;
    const isCreator = ticket.createdById === decoded.userId;
    const isAccountant = decoded.role === "ACCOUNTANT";

    if (!isAdmin && !isManager && !isAssigned && !isCreator && !isAccountant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view comments",
          },
        },
        { status: 403 },
      );
    }

    // Filter comments based on role
    // Clients can only see public comments
    const where: any = { ticketId: id };
    if (decoded.role === "CLIENT") {
      where.isInternal = false;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("[Get Comments Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch comments",
          details: error,
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(
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

    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = createCommentSchema.safeParse(body);
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

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Ticket not found" },
        },
        { status: 404 },
      );
    }

    // Role-based access control for commenting
    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";
    const isAssigned = ticket.assignedToId === decoded.userId;
    const isCreator = ticket.createdById === decoded.userId;

    if (!isAdmin && !isManager && !isAssigned && !isCreator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to comment on this ticket",
          },
        },
        { status: 403 },
      );
    }

    // Clients cannot create internal comments
    if (decoded.role === "CLIENT" && validation.data.isInternal) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Clients cannot create internal comments",
          },
        },
        { status: 403 },
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        ticketId: id,
        userId: decoded.userId,
        content: validation.data.content,
        isInternal: validation.data.isInternal,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("[Create Comment Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create comment" },
      },
      { status: 500 },
    );
  }
}
