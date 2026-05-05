import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
const robotsParser = require('robots-parser');
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class WebConnectorService implements IConnector {
  private readonly logger = new Logger(WebConnectorService.name);
  private readonly MAX_PAGES = 5;
  private readonly TIMEOUT = 15000;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async fetch(url: string): Promise<CollectedData[]> {
    return this.scrape(url);
  }

  private async canFetch(url: string): Promise<boolean> {
    try {
      const parsedUrl = new URL(url);
      const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
      
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'Collector-Engine/1.0' },
      }).catch(() => null);

      if (!response || response.status !== 200) {
        return true;
      }

      const robots = robotsParser(robotsUrl, response.data);
      return robots.canFetch('Collector-Engine/1.0', url);
    } catch {
      return true;
    }
  }

  private async fetchWithRetry(url: string, attempt = 1): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          'User-Agent': 'Collector-Engine/1.0 (Strategic Monitoring Bot)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      return data;
    } catch (error) {
      if (attempt < this.MAX_RETRIES) {
        this.logger.warn(`⚠️ Retry ${attempt}/${this.MAX_RETRIES} for ${url}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  private extractPublishDate($: cheerio.CheerioAPI): Date | undefined {
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[name="pubdate"]',
      'meta[name="publishdate"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]',
      'time[datetime]',
      'time[pubdate]',
      '[class*="date" i]',
      '[class*="time" i]',
      '[class*="publish" i]',
    ];

    for (const selector of selectors) {
      const el = $(selector).first();
      const content = el.attr('content') || el.attr('datetime') || el.text();
      
      if (content) {
        const date = new Date(content.trim());
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return undefined;
  }

  async scrape(url: string): Promise<CollectedData[]> {
    this.logger.log(`🕸️ Scraping web pages from: ${url}`);

    const visited = new Set<string>();
    const items: CollectedData[] = [];
    const queue: string[] = [url];
    let pageCount = 0;

    const canFetch = await this.canFetch(url);
    if (!canFetch) {
      this.logger.warn(`⚠️ robots.txt disallows fetching: ${url}`);
      return [];
    }

    while (queue.length > 0 && pageCount < this.MAX_PAGES) {
      const currentUrl = queue.shift()!;
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      pageCount++;

      try {
        const data = await this.fetchWithRetry(currentUrl);

        const $ = cheerio.load(data);
        $('script, style, nav, header, footer, aside, [class*="ads" i], [class*="banner" i]').remove();
        
        const title = $('title').text().trim() || $('h1').first().text().trim();
        const content = $('body').text().replace(/\s+/g, ' ').trim();
        const publishedAt = this.extractPublishDate($);

        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && (href.startsWith('http') || href.startsWith('/'))) {
            try {
              const absolute = href.startsWith('http') 
                ? href 
                : new URL(href, currentUrl).href;
              if (!visited.has(absolute) && this.isSameDomain(url, absolute)) {
                links.push(absolute);
              }
            } catch {}
          }
        });

        items.push({
          sourceUrl: currentUrl,
          sourceType: 'WEB',
          title,
          description: content.substring(0, 200),
          content,
          contentRaw: content,
          publishedAt,
        });

        queue.push(...links.slice(0, 10));
        this.logger.log(`📄 Page ${pageCount}/${this.MAX_PAGES}: ${currentUrl}${publishedAt ? ` (${publishedAt.toISOString()})` : ''}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(`❌ Failed to fetch ${currentUrl}: ${error.message}`);
      }
    }

    this.logger.log(`✅ Web: scraped ${items.length} pages`);
    return items;
  }

  private isSameDomain(baseUrl: string, targetUrl: string): boolean {
    try {
      return new URL(baseUrl).hostname === new URL(targetUrl).hostname;
    } catch {
      return false;
    }
  }
}