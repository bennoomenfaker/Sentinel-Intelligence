-- CreateTable
CREATE TABLE "CollectionPlan" (
    "id" TEXT NOT NULL,
    "hypothesisId" TEXT NOT NULL DEFAULT 'placeholder',
    "projectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'ON_DEMAND',
    "collectionStartDate" TIMESTAMP(3),
    "collectionEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCollectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "collectionPlanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "collectionPlanId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INCLUDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "collectionPlanId" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "contentRaw" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "matchedKeywords" TEXT[],
    "wordStats" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionJob" (
    "id" TEXT NOT NULL,
    "collectionPlanId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsCollected" INTEGER NOT NULL DEFAULT 0,
    "itemsFiltered" INTEGER NOT NULL DEFAULT 0,
    "itemsStored" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CollectionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionPlan_projectId_idx" ON "CollectionPlan"("projectId");

-- CreateIndex
CREATE INDEX "CollectionPlan_hypothesisId_idx" ON "CollectionPlan"("hypothesisId");

-- CreateIndex
CREATE INDEX "CollectionPlan_frequency_isActive_idx" ON "CollectionPlan"("frequency", "isActive");

-- CreateIndex
CREATE INDEX "Source_collectionPlanId_type_idx" ON "Source"("collectionPlanId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_collectionPlanId_word_type_key" ON "Keyword"("collectionPlanId", "word", "type");

-- CreateIndex
CREATE UNIQUE INDEX "RawItem_contentHash_key" ON "RawItem"("contentHash");

-- CreateIndex
CREATE INDEX "RawItem_projectId_idx" ON "RawItem"("projectId");

-- CreateIndex
CREATE INDEX "RawItem_collectionPlanId_idx" ON "RawItem"("collectionPlanId");

-- CreateIndex
CREATE INDEX "RawItem_contentHash_idx" ON "RawItem"("contentHash");

-- CreateIndex
CREATE INDEX "RawItem_fetchedAt_idx" ON "RawItem"("fetchedAt");

-- CreateIndex
CREATE INDEX "CollectionJob_collectionPlanId_status_idx" ON "CollectionJob"("collectionPlanId", "status");

-- CreateIndex
CREATE INDEX "CollectionJob_projectId_startedAt_idx" ON "CollectionJob"("projectId", "startedAt");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_collectionPlanId_fkey" FOREIGN KEY ("collectionPlanId") REFERENCES "CollectionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_collectionPlanId_fkey" FOREIGN KEY ("collectionPlanId") REFERENCES "CollectionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawItem" ADD CONSTRAINT "RawItem_collectionPlanId_fkey" FOREIGN KEY ("collectionPlanId") REFERENCES "CollectionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawItem" ADD CONSTRAINT "RawItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionJob" ADD CONSTRAINT "CollectionJob_collectionPlanId_fkey" FOREIGN KEY ("collectionPlanId") REFERENCES "CollectionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
