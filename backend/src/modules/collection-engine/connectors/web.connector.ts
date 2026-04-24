import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class WebConnectorService implements IConnector {
  private readonly logger = new Logger(WebConnectorService.name);
  private readonly MAX_PAGES = 5;
  private readonly TIMEOUT = 15000;

  async fetch(url: string): Promise<CollectedData[]> {
    return this.scrape(url);
  }

  async scrape(url: string): Promise<CollectedData[]> {
    this.logger.log(`🕸️ Scraping web pages from: ${url}`);

    const visited = new Set<string>();
    const items: CollectedData[] = [];
    const queue: string[] = [url];
    let pageCount = 0;

    while (queue.length > 0 && pageCount < this.MAX_PAGES) {
      const currentUrl = queue.shift()!;
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      pageCount++;

      try {
        const { data, status } = await axios.get(currentUrl, {
          timeout: this.TIMEOUT,
          headers: {
            'User-Agent': 'Collector-Engine/1.0 (Strategic Monitoring Bot)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });

        if (status !== 200) {
          this.logger.warn(`⚠️ Unexpected status ${status} for ${currentUrl}`);
          continue;
        }

        const $ = cheerio.load(data);
        $('script, style, nav, header, footer, aside').remove();
        
        const title = $('title').text().trim() || $('h1').first().text().trim();
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && (href.startsWith('http') || href.startsWith('/'))) {
            const absolute = href.startsWith('http') 
              ? href 
              : new URL(href, url).href;
            if (!visited.has(absolute)) {
              links.push(absolute);
            }
          }
        });

        items.push({
          sourceUrl: currentUrl,
          sourceType: 'WEB',
          title,
          description: content.substring(0, 200),
          content,
          contentRaw: content,
          publishedAt: undefined,
        });

        queue.push(...links.slice(0, 10));
        this.logger.log(`📄 Page ${pageCount}/${this.MAX_PAGES}: ${currentUrl}`);
      } catch (error) {
        this.logger.error(`❌ Failed to fetch ${currentUrl}: ${error.message}`);
      }
    }

    this.logger.log(`✅ Web: scraped ${items.length} pages`);
    return items;
  }
}