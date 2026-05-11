import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const devices = [
    { name: "Keyboard #1", type: "keyboard" },
    { name: "Keyboard #2", type: "keyboard" },
    { name: "Keyboard #3", type: "keyboard" },
    { name: "Keyboard #4", type: "keyboard" },
    { name: "Keyboard #5", type: "keyboard" },
    { name: "Mouse #1", type: "mouse" },
    { name: "Mouse #2", type: "mouse" },
    { name: "Mouse #3", type: "mouse" },
    { name: "Mouse #4", type: "mouse" },
    { name: "Mouse #5", type: "mouse" },
  ];

  for (const device of devices) {
    await prisma.device.create({ data: device });
  }

  console.log("Seeded", devices.length, "devices.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
