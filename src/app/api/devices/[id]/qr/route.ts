import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/device/${id}`;

  const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
