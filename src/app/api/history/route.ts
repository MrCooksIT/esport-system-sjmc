import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checkouts = await prisma.checkout.findMany({
    include: { device: true },
    orderBy: { checkedOutAt: "desc" },
    take: 200,
  });
  return NextResponse.json(checkouts);
}
