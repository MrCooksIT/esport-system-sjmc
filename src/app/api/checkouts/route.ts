import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checkouts = await prisma.checkout.findMany({
    where: { returnedAt: null },
    include: { device: true },
    orderBy: { checkedOutAt: "asc" },
  });
  return NextResponse.json(checkouts);
}

export async function POST(request: Request) {
  const { deviceId, playerName } = await request.json();
  if (!deviceId || !playerName?.trim()) {
    return NextResponse.json({ error: "deviceId and playerName are required" }, { status: 400 });
  }

  const existing = await prisma.checkout.findFirst({
    where: { deviceId: Number(deviceId), returnedAt: null },
  });
  if (existing) {
    return NextResponse.json({ error: "Device is already checked out" }, { status: 409 });
  }

  const checkout = await prisma.checkout.create({
    data: { deviceId: Number(deviceId), playerName: playerName.trim() },
    include: { device: true },
  });
  return NextResponse.json(checkout, { status: 201 });
}
