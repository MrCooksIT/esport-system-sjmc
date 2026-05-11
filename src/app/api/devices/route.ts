import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get("all") === "true";

  const devices = await prisma.device.findMany({
    where: showAll ? undefined : { active: true },
    include: {
      checkouts: {
        where: { returnedAt: null },
        take: 1,
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(devices);
}

export async function POST(request: Request) {
  const { name, type } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  const device = await prisma.device.create({ data: { name, type } });
  return NextResponse.json(device, { status: 201 });
}
