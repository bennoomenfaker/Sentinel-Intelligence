import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class PdfConnectorService implements IConnector {
  private readonly logger = new Logger(PdfConnectorService.name);
  private readonly TIMEOUT = 30000;

  async fetch(url: string): Promise<CollectedData[]> {
    this.logger.log(`📄 Fetching PDF: ${url}`);
    const items: CollectedData[] = [];

    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Collector-Engine/1.0',
        },
      });

      const headers = response.headers as any;
      const contentType = headers['content-type'] || '';
      
      if (!contentType || !contentType.includes('pdf')) {
        this.logger.warn(`⚠️ Not a PDF file: ${contentType}`);
        return [];
      }

      const filename = url.split('/').pop() || 'document.pdf';

      items.push({
        sourceUrl: url,
        sourceType: 'PDF',
        title: filename,
        description: 'PDF document downloaded',
        content: `[PDF Binary Data - ${response.data.length} bytes]`,
        contentRaw: `[PDF Binary Data - ${response.data.length} bytes]`,
        publishedAt: undefined,
      });

      this.logger.log(`✅ PDF: downloaded ${response.data.length} bytes`);
      return items;
    } catch (error) {
      this.logger.error(`❌ PDF fetch failed: ${error.message}`);
      throw error;
    }
  }

  async savePdf(url: string, projectId: string): Promise<void> {
    this.logger.log(`💾 Saving PDF for project ${projectId}: ${url}`);
  }
}