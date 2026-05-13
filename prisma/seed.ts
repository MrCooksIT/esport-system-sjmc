import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const devices = [
    { name: "Keyboard #1", type: "keyboard" },
    { name: "Keyboard #2", type: "keyboard" },
    { name: "Keyboard #3", type: "keyboard" },
    { name: "Keyboard #4", type: "keyboard" },
    { name: "Keyboard #5", type: "keyboard" },
    { name: "Keyboard #6", type: "keyboard" },
    { name: "Mouse #1", type: "mouse" },
    { name: "Mouse #2", type: "mouse" },
    { name: "Mouse #3", type: "mouse" },
    { name: "Mouse #4", type: "mouse" },
    { name: "Mouse #5", type: "mouse" },
    { name: "Mouse #6", type: "mouse" },
  ];

  for (const device of devices) {
    await prisma.device.upsert({
      where: { id: devices.indexOf(device) + 1 },
      update: {},
      create: device,
    });
  }

  console.log("Seeded", devices.length, "devices.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
