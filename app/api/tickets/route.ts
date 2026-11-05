import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validations";
import { calculateTicketPrice } from "@/lib/ticket-utils";
import { generateTicketNumber } from "@/lib/ticket-db";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    // Role-based filtering
    // ADMIN, MANAGER, and ACCOUNTANT can see all tickets
    // DEVELOPER can see assigned tickets
    // CLIENT can see their own tickets
    if (decoded.role === "DEVELOPER") {
      where.assignedToId = decoded.userId;
    } else if (decoded.role === "CLIENT") {
      where.createdById = decoded.userId;
    }
    // ADMIN, MANAGER, ACCOUNTANT see all tickets (no filter)

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { ticketNumber: { contains: search } },
      ];
    }

    const total = await prisma.ticket.count({ where });
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[Get Tickets Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la récupération des tickets",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    console.log("[Create Ticket] Request body:", body);

    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      console.error(
        "[Create Ticket] Validation error:",
        validation.error.errors,
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.errors[0].message,
            details: validation.error.errors,
          },
        },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      priority,
      complexity,
      estimatedHours,
      hourlyRate,
    } = validation.data;

    const ticketNumber = await generateTicketNumber();
    const calculatedPrice = calculateTicketPrice(0, hourlyRate, complexity);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority,
        complexity,
        estimatedHours,
        hourlyRate,
        calculatedPrice,
        createdById: decoded.userId,
        status: "NEW",
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    console.log("[Create Ticket] Success:", ticket.ticketNumber);
    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error("[Create Ticket Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Échec de la création du ticket",
        },
      },
      { status: 500 },
    );
  }
}
