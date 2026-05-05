import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
// @ts-ignore
const pdfParse = require('pdf-parse');
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
      
      let extractedText = '';
      let pageCount = 0;
      
      try {
        const pdfData = await pdfParse(response.data);
        extractedText = pdfData.text || '';
        pageCount = pdfData.numpages || 0;
      } catch (parseError) {
        this.logger.warn(`⚠️ PDF text extraction failed: ${parseError.message}`);
        extractedText = `[PDF Parse Error - ${response.data.length} bytes]`;
      }

      const content = extractedText || `[PDF No extractable text - ${response.data.length} bytes]`;

      items.push({
        sourceUrl: url,
        sourceType: 'PDF',
        title: filename,
        description: content.substring(0, 200),
        content,
        contentRaw: content,
        publishedAt: undefined,
      });

      this.logger.log(`✅ PDF: ${response.data.length} bytes, ${pageCount} pages, ${extractedText.length} chars extracted`);
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