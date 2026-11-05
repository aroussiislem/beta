import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { calculateTicketPrice } from "@/lib/ticket-utils";

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
    const { action, timerSessionId, endTime, notes } = await request.json();

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

    // Role-based access control for timer operations
    // Only ADMIN, MANAGER, DEVELOPER (assigned), can manage timers
    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";
    const isAssigned = ticket.assignedToId === decoded.userId;

    if (!isAdmin && !isManager && !isAssigned) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to manage timers for this ticket",
          },
        },
        { status: 403 },
      );
    }

    if (action === "start") {
      // Start a new timer session
      const session = await prisma.timerSession.create({
        data: {
          ticketId: id,
          userId: decoded.userId,
          startTime: new Date(),
          notes: notes || null,
        },
      });

      return NextResponse.json(
        { success: true, data: session, action: "started" },
        { status: 201 },
      );
    } else if (action === "stop") {
      // Stop and save timer session
      if (!timerSessionId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "timerSessionId required",
            },
          },
          { status: 400 },
        );
      }

      const session = await prisma.timerSession.findUnique({
        where: { id: timerSessionId },
      });
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Timer session not found" },
          },
          { status: 404 },
        );
      }

      const endDateTime = new Date(endTime || new Date());
      const durationMs = endDateTime.getTime() - session.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Update timer session
      const updated = await prisma.timerSession.update({
        where: { id: timerSessionId },
        data: {
          endTime: endDateTime,
          duration: durationHours,
        },
      });

      // Recalculate ticket total hours and price
      const allSessions = await prisma.timerSession.findMany({
        where: { ticketId: id, endTime: { not: null } },
      });

      const totalHours = allSessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0,
      );
      const newPrice = calculateTicketPrice(
        totalHours,
        ticket.hourlyRate,
        ticket.complexity,
      );

      // Update ticket with new totals
      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: {
          actualHours: totalHours,
          calculatedPrice: newPrice,
        },
      });

      return NextResponse.json({
        success: true,
        data: { session: updated, ticket: updatedTicket },
        action: "stopped",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid action" },
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("[Timer Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to process timer" },
      },
      { status: 500 },
    );
  }
}

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
            message: "Not authorized to view timer sessions",
          },
        },
        { status: 403 },
      );
    }

    const sessions = await prisma.timerSession.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("[Get Timer Sessions Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch sessions" },
      },
      { status: 500 },
    );
  }
}
