-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "accessoriesOk" BOOLEAN NOT NULL DEFAULT true,
    "conditionOk" BOOLEAN NOT NULL DEFAULT true,
    "checkedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
