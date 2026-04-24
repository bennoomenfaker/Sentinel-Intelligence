import { Injectable, Logger } from '@nestjs/common';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class RssConnectorService implements IConnector {
  private readonly logger = new Logger(RssConnectorService.name);

  async fetch(url: string): Promise<CollectedData[]> {
    this.logger.log(`📥 Fetching RSS feed: ${url}`);

    try {
      const Parser = (await import('rss-parser')).default;
      const parser = new Parser({
        timeout: 10000,
        headers: {
          'User-Agent': 'Collector-Engine/1.0 (Strategic Monitoring Bot)',
        },
      });

      const feed = await parser.parseURL(url);
      const items: CollectedData[] = [];

      for (const item of feed.items.slice(0, 20)) {
        const content = item.contentSnippet || item.content || '';
        items.push({
          sourceUrl: item.link || url,
          sourceType: 'RSS',
          title: item.title,
          description: content.substring(0, 200),
          content: content,
          contentRaw: content,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        });
      }

      this.logger.log(`✅ RSS: fetched ${items.length} items from ${feed.title || url}`);
      return items;
    } catch (error) {
      this.logger.error(`❌ RSS fetch failed for ${url}: ${error.message}`);
      throw error;
    }
  }
}