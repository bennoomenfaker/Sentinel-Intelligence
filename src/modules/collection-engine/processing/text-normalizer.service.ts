import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TextNormalizerService {
  private readonly logger = new Logger(TextNormalizerService.name);

  normalize(text: string): string {
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/&[a-z]+;/gi, ' ');
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ' ');
    cleaned = cleaned.replace(/[^\w\s\u00C0-\u024F]/gi, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  clean(text: string): string {
    return this.normalize(text);
  }

  toLowerCase(text: string): string {
    return text.toLowerCase();
  }
}