import { prisma } from "./prisma";

export async function generateTicketNumber(): Promise<string> {
  // Get the latest ticket number from database
  const latestTicket = await prisma.ticket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { ticketNumber: true },
  });

  let nextNumber = 1;
  if (latestTicket?.ticketNumber) {
    // Extract number from format SP-0001
    const match = latestTicket.ticketNumber.match(/SP-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `SP-${String(nextNumber).padStart(4, "0")}`;
}
