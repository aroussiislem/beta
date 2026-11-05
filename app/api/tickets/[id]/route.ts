import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import {
  updateTicketSchema,
  assignTicketSchema,
  changeStatusSchema,
} from "@/lib/validations";
import { calculateTicketPrice } from "@/lib/ticket-utils";

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
          error: { code: "UNAUTHORIZED", message: "Authentification requise" },
        },
        { status: 401 },
      );
    }

    const { id } = params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        timerSessions: true,
        comments: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Ticket non trouvé" },
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

    // ADMIN and MANAGER can see all tickets
    // DEVELOPER can see assigned tickets
    // CLIENT can see their own tickets
    // ACCOUNTANT can see all tickets (for financial purposes)
    if (!isAdmin && !isManager && !isAssigned && !isCreator && !isAccountant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Non autorisé à consulter ce ticket",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("[Get Ticket Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Échec de la récupération du ticket",
          details: error,
        },
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
    const token = request.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token || "");
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Aucun jeton fourni" },
        },
        { status: 401 },
      );
    }

    const { id } = params;
    const body = await request.json();

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Ticket non trouvé" },
        },
        { status: 404 },
      );
    }

    // Role-based access control for updates
    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";
    const isAssigned = ticket.assignedToId === decoded.userId;
    const isCreator = ticket.createdById === decoded.userId;

    // ADMIN and MANAGER can update any ticket
    // DEVELOPER can update assigned tickets
    // CLIENT can update their own tickets (limited fields)
    if (!isAdmin && !isManager && !isAssigned && !isCreator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Non autorisé à mettre à jour ce ticket",
          },
        },
        { status: 403 },
      );
    }

    const validation = updateTicketSchema.safeParse(body);
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

    const updateData: any = validation.data;

    // Recalculate price if complexity or hourlyRate changed
    if (
      validation.data.complexity ||
      validation.data.hourlyRate ||
      ticket.actualHours !== (ticket.actualHours || 0)
    ) {
      const complexity = validation.data.complexity || ticket.complexity;
      const hourlyRate = validation.data.hourlyRate || ticket.hourlyRate;
      updateData.calculatedPrice = calculateTicketPrice(
        ticket.actualHours,
        hourlyRate,
        complexity,
      );
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Update Ticket Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la mise à jour du ticket",
        },
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
    const token = request.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token || "");
    if (!decoded || !["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 },
      );
    }

    const { id } = params;
    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Ticket supprimé" });
  } catch (error) {
    console.error("[Delete Ticket Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la suppression du ticket",
        },
      },
      { status: 500 },
    );
  }
}
