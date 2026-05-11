import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { active } = await request.json();
  const device = await prisma.device.update({
    where: { id: Number(id) },
    data: { active },
  });
  return NextResponse.json(device);
}
