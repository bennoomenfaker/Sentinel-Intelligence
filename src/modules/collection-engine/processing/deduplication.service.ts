import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';

interface RawItemDraft {
  sourceUrl: string;
  sourceType: string;
  title?: string;
  description?: string;
  contentRaw: string;
  publishedAt?: Date;
}

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  generateHash(title: string | undefined, url: string, publishedAt?: Date | string): string {
    const data = [
      title || '',
      url,
      publishedAt ? new Date(publishedAt).toISOString() : '',
    ].join('|');

    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  async filterUnique(items: RawItemDraft[], projectId: string): Promise<RawItemDraft[]> {
    const unique: RawItemDraft[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      const hash = this.generateHash(item.title, item.sourceUrl, item.publishedAt);
      
      if (!seen.has(hash)) {
        const existing = await this.prisma.rawItem.findUnique({
          where: { contentHash: hash },
        });

        if (!existing) {
          seen.add(hash);
          unique.push(item);
        }
      }
    }

    this.logger.log(`🔁 Deduplication: ${items.length} → ${unique.length} unique items`);
    return unique;
  }
}