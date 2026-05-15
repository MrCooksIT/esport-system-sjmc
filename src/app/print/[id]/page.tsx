import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = await prisma.device.findUnique({ where: { id: Number(id) } });
  if (!device) notFound();

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/device/${id}`;

  const svg = await QRCode.toString(url, { type: "svg", margin: 1 });

  return (
    <html>
      <head>
        <title>QR — {device.name}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: sans-serif; text-align: center; padding: 40px; background: white; color: black; }
          .qr { width: 220px; height: 220px; margin: 0 auto; }
          .qr svg { width: 100%; height: 100%; }
          h2 { margin-top: 16px; font-size: 22px; font-weight: bold; }
          p { margin-top: 6px; color: #555; font-size: 13px; }
          @media print { body { padding: 20px; } }
        `}</style>
      </head>
      <body>
        <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
        <h2>{device.name}</h2>
        <p>Scan to check out or return</p>
        <script dangerouslySetInnerHTML={{ __html: "window.onload = () => window.print();" }} />
      </body>
    </html>
  );
}
