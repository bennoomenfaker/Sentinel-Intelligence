import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WordAnalyzerService } from '../processing/word-analyzer.service';
import { TextNormalizerService } from '../processing/text-normalizer.service';

@Injectable()
export class RawItemService {
  private readonly logger = new Logger(RawItemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wordAnalyzer: WordAnalyzerService,
    private readonly textNormalizer: TextNormalizerService,
  ) {}

  async create(data: {
    projectId: string;
    collectionPlanId: string;
    sourceId?: string;
    sourceType: string;
    sourceUrl: string;
    title?: string;
    description?: string;
    publishedAt?: Date;
    contentRaw: string;
    contentHash: string;
    matchedKeywords: string[];
    wordStats?: any;
    statusCode?: number;
    errorMessage?: string;
    metadata?: object;
  }) {
    const cleanedContent = this.textNormalizer.normalize(data.contentRaw);
    const wordStats = data.wordStats || this.wordAnalyzer.analyze(cleanedContent);

    return this.prisma.rawItem.create({
      data: {
        projectId: data.projectId,
        collectionPlanId: data.collectionPlanId,
        sourceId: data.sourceId,
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        contentRaw: data.contentRaw,
        contentHash: data.contentHash,
        matchedKeywords: data.matchedKeywords,
        wordStats: wordStats as any,
        statusCode: data.statusCode,
        errorMessage: data.errorMessage,
        metadata: data.metadata as any,
      },
    });
  }

  async saveBulk(
    items: {
      sourceUrl: string;
      sourceType: string;
      title?: string;
      description?: string;
      contentRaw: string;
      publishedAt?: Date;
      wordStats?: any;
      aiAnalysis?: any;
    }[],
    collectionPlanId: string,
    projectId: string,
    sourceId: string
  ): Promise<any[]> {
    const saved: any[] = [];

    for (const item of items) {
      const contentHash = this.generateHash(item.title, item.sourceUrl, item.publishedAt);
      
      const existing = await this.prisma.rawItem.findUnique({
        where: { contentHash },
      });

      if (existing) continue;

      const matchedKeywords = this.extractKeywords(item.contentRaw);

      const savedItem = await this.prisma.rawItem.create({
        data: {
          projectId,
          collectionPlanId,
          sourceId,
          sourceType: item.sourceType,
          sourceUrl: item.sourceUrl,
          title: item.title,
          description: item.description,
          publishedAt: item.publishedAt,
          contentRaw: item.contentRaw,
          contentHash,
          matchedKeywords,
          wordStats: item.wordStats as any,
          aiAnalysis: item.aiAnalysis as any,
          statusCode: 200,
        },
      });

      saved.push(savedItem);
    }

    this.logger.log(`💾 Saved ${saved.length} items to database`);
    return saved;
  }

  private generateHash(title: string | undefined, url: string, publishedAt?: Date): string {
    const crypto = require('crypto');
    const data = [
      title || '',
      url,
      publishedAt ? new Date(publishedAt).toISOString() : '',
    ].join('|');
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private extractKeywords(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const keywords: string[] = ['ai', 'startup', 'tech'];
    return keywords.filter(kw => lowerContent.includes(kw));
  }

  async findByCollectionPlan(collectionPlanId: string, projectId: string) {
    const plan = await this.prisma.collectionPlan.findUnique({
      where: { id: collectionPlanId },
    });

    if (!plan || plan.projectId !== projectId) {
      throw new NotFoundException('Collection plan not found');
    }

    const items = await this.prisma.rawItem.findMany({
      where: { collectionPlanId, projectId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const typedItems = items.map((item: any) => ({
      ...item,
      wordStats: item.wordStats as any,
    }));

    const wordCloud = this.wordAnalyzer.aggregateWordCloud(typedItems);

    return { items, wordCloud };
  }
}