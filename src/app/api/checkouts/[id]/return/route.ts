import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { pin } = await request.json();

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 });
  }

  const checkout = await prisma.checkout.update({
    where: { id: Number(id) },
    data: { returnedAt: new Date() },
    include: { device: true },
  });
  return NextResponse.json(checkout);
}
