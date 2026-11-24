-- CreateTable
CREATE TABLE "PasswordResetHistory" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "device" TEXT,
    "deviceModel" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "userAgent" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordResetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordResetHistory_userId_idx" ON "PasswordResetHistory"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetHistory_changedAt_idx" ON "PasswordResetHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "PasswordResetHistory" ADD CONSTRAINT "PasswordResetHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
