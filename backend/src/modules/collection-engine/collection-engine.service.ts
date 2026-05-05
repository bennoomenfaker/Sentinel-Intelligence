import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollectionPlanDto } from './dto/create-collection-plan.dto';
import { AddSourceDto } from './dto/add-source.dto';
import { AddKeywordDto } from './dto/add-keyword.dto';
import { KeywordFilterService } from './processing/keyword-filter.service';
import { DeduplicationService } from './processing/deduplication.service';
import { TextNormalizerService } from './processing/text-normalizer.service';
import { WordAnalyzerService } from './processing/word-analyzer.service';
import { WordStat } from './processing/word-analyzer.service';
import { AiProcessingService } from './processing/ai-processing.service';
import { RssConnectorService } from './connectors/rss.connector';
import { WebConnectorService } from './connectors/web.connector';
import { PdfConnectorService } from './connectors/pdf.connector';
import { RawItemService } from './storage/raw-item.service';
import { SchedulerService } from './scheduling/scheduler.service';

export interface RawItemDraft {
  sourceUrl: string;
  sourceType: string;
  title?: string;
  description?: string;
  contentRaw: string;
  publishedAt?: Date;
}

export interface CollectionResult {
  success: boolean;
  collected: number;
  items: any[];
  wordCloud: WordStat[];
}

@Injectable()
export class CollectionEngineService implements OnModuleInit {
  private readonly logger = new Logger(CollectionEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rssConnector: RssConnectorService,
    private readonly webConnector: WebConnectorService,
    private readonly pdfConnector: PdfConnectorService,
    private readonly keywordFilter: KeywordFilterService,
    private readonly dedupService: DeduplicationService,
    private readonly textNormalizer: TextNormalizerService,
    private readonly wordAnalyzer: WordAnalyzerService,
    private readonly aiProcessing: AiProcessingService,
    private readonly rawItemService: RawItemService,
    private readonly schedulerService: SchedulerService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔄 Collection Engine initialized');
    await this.schedulerService.startScheduler();
  }

  // 🔧 CRUD Operations
  async createCollectionPlan(dto: CreateCollectionPlanDto) {
    return this.prisma.collectionPlan.create({
      data: {
        projectId: dto.projectId,
        question: dto.question,
        hypothesisId: dto.hypothesisId || 'placeholder',
        frequency: dto.frequency || 'ON_DEMAND',
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listCollectionPlans(projectId: string) {
    return this.prisma.collectionPlan.findMany({
      where: { projectId },
      include: { sources: true, keywords: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCollectionPlan(id: string, projectId: string) {
    const plan = await this.prisma.collectionPlan.findFirst({
      where: { id, projectId },
      include: { sources: true, keywords: true },
    });

    if (!plan) {
      throw new NotFoundException(`Collection plan ${id} not found for project ${projectId}`);
    }

    return plan;
  }

  async addSource(id: string, projectId: string, dto: AddSourceDto) {
    const plan = await this.getCollectionPlan(id, projectId);

    return this.prisma.source.create({
      data: {
        collectionPlanId: plan.id,
        type: dto.type.toUpperCase(),
        url: dto.url,
        label: dto.label,
        isActive: dto.isActive !== 'false',
      },
    });
  }

  async addKeyword(id: string, projectId: string, dto: AddKeywordDto) {
    const plan = await this.getCollectionPlan(id, projectId);

    return this.prisma.keyword.create({
      data: {
        collectionPlanId: plan.id,
        word: dto.word,
        type: dto.type || 'INCLUDE',
      },
    });
  }

  async deleteSource(id: string, sourceId: string, projectId: string) {
    await this.getCollectionPlan(id, projectId);
    
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) {
      return { message: 'Source already deleted or not found' };
    }
    
    return this.prisma.source.delete({
      where: { id: sourceId },
    });
  }

  async deleteKeyword(id: string, keywordId: string, projectId: string) {
    await this.getCollectionPlan(id, projectId);
    
    const keyword = await this.prisma.keyword.findUnique({ where: { id: keywordId } });
    if (!keyword) {
      return { message: 'Keyword already deleted or not found' };
    }
    
    return this.prisma.keyword.delete({
      where: { id: keywordId },
    });
  }

  async deleteCollectionPlan(id: string, projectId: string) {
    const plan = await this.prisma.collectionPlan.findFirst({
      where: { id, projectId },
    });
    
    if (!plan) {
      return { message: 'Plan already deleted or not found' };
    }
    
    return this.prisma.collectionPlan.delete({
      where: { id },
    });
  }

  // 🎯 Main Collection Flow
  async collect(projectId: string, planId: string): Promise<CollectionResult> {
    this.logger.log(`🚀 Starting collection for plan ${planId}, project ${projectId}`);

    const plan = await this.prisma.collectionPlan.findFirst({
      where: { id: planId, projectId, isActive: true },
      include: { sources: { where: { isActive: true } }, keywords: true },
    });

    if (!plan) {
      throw new NotFoundException('Collection plan not found or inactive');
    }

    const job = await this.prisma.collectionJob.create({
      data: {
        collectionPlanId: plan.id,
        projectId,
        triggeredBy: 'MANUAL',
        status: 'RUNNING',
      },
    });

    let itemsCollected = 0;
    let itemsFiltered = 0;
    let itemsStored = 0;
    const allItems: any[] = [];

    for (const source of plan.sources) {
      this.logger.log(`📡 Processing source: ${source.type} - ${source.url}`);

      try {
        let rawItems: RawItemDraft[] = [];

        switch (source.type) {
          case 'RSS':
            rawItems = await this.rssConnector.fetch(source.url);
            break;
          case 'WEB':
            rawItems = await this.webConnector.scrape(source.url);
            break;
          case 'PDF':
            rawItems = await this.pdfConnector.fetch(source.url);
            break;
          default:
            this.logger.warn(`⚠️ Unknown source type: ${source.type}`);
            continue;
        }

        itemsCollected += rawItems.length;
        this.logger.log(`📥 Collected ${rawItems.length} items from ${source.url}`);

        // 🔍 Keyword filtering
        const filtered = rawItems.filter((item) =>
          this.keywordFilter.match(item.contentRaw, plan.keywords)
        );

        itemsFiltered += filtered.length;
        this.logger.log(`🔍 Filtered to ${filtered.length} items by keywords`);

        // 🔁 Deduplication
        const unique = await this.dedupService.filterUnique(filtered, projectId);

        // 🧹 Text normalization
        const cleaned = unique.map((item) => ({
          ...item,
          contentRaw: this.textNormalizer.clean(item.contentRaw),
        }));

        // 📊 Word analysis
        const withStats = cleaned.map((item) => {
          const wordStats = this.wordAnalyzer.getTopWords(item.contentRaw, 20);
          const aiAnalysis = this.aiProcessing.processAll(item.contentRaw);
          return {
            ...item,
            wordStats,
            aiAnalysis,
          };
        });

        // 💾 Bulk save
        const savedItems = await this.rawItemService.saveBulk(
          withStats,
          plan.id,
          projectId,
          source.id
        );

        allItems.push(...savedItems);
        itemsStored += savedItems.length;

        this.logger.log(`💾 Stored ${savedItems.length} items`);
      } catch (error) {
        this.logger.error(`❌ Source ${source.url} failed: ${error.message}`);
      }
    }

    // Update plan and job
    await this.prisma.collectionPlan.update({
      where: { id: planId },
      data: { lastCollectedAt: new Date() },
    });

    await this.prisma.collectionJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        itemsCollected,
        itemsFiltered,
        itemsStored,
        completedAt: new Date(),
      },
    });

    const wordCloud = this.wordAnalyzer.aggregateWordCloud(allItems);

    this.logger.log(
      `✅ Collection completed: ${itemsCollected} collected, ${itemsFiltered} filtered, ${itemsStored} stored`
    );

    return {
      success: true,
      collected: itemsStored,
      items: allItems,
      wordCloud,
    };
  }

  async triggerCollection(id: string, projectId: string) {
    this.logger.log(`📋 Collection triggered for plan ${id}`);
    
    const job = await this.prisma.collectionJob.create({
      data: {
        collectionPlanId: id,
        projectId,
        triggeredBy: 'MANUAL',
        status: 'PENDING',
      },
    });

    // Run in background
    setTimeout(() => {
      this.collect(projectId, id).catch((err) => {
        this.logger.error(`❌ Collection failed: ${err.message}`);
      });
    }, 100);

    return { jobId: job.id, status: 'PENDING', message: 'Collection started in background' };
  }

  async runCollectionNow(id: string, projectId: string) {
    return this.collect(projectId, id);
  }

  async getCollectedItems(id: string, projectId: string) {
    await this.getCollectionPlan(id, projectId);
    return this.rawItemService.findByCollectionPlan(id, projectId);
  }

  async getCollectionResults(id: string, projectId: string) {
    await this.getCollectionPlan(id, projectId);
    
    const items = await this.prisma.rawItem.findMany({
      where: { collectionPlanId: id, projectId },
      orderBy: { fetchedAt: 'desc' },
      take: 100,
    });

    const typedItems = items.map((item: any) => ({
      ...item,
      wordStats: item.wordStats as any,
    }));

    const wordCloud = this.wordAnalyzer.aggregateWordCloud(typedItems);

    return { 
      items, 
      wordCloud,
      total: items.length,
    };
  }

  async getCollectionJobs(id: string, projectId: string) {
    await this.getCollectionPlan(id, projectId);
    
    return this.prisma.collectionJob.findMany({
      where: { collectionPlanId: id, projectId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  analyzeWithAi(content: string) {
    return this.aiProcessing.processAll(content);
  }
}