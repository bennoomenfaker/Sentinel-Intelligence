import { Module } from '@nestjs/common';
import { CollectionEngineController } from './collection-engine.controller';
import { CollectionEngineService } from './collection-engine.service';
import { RssConnectorService } from './connectors/rss.connector';
import { WebConnectorService } from './connectors/web.connector';
import { PdfConnectorService } from './connectors/pdf.connector';
import { KeywordFilterService } from './processing/keyword-filter.service';
import { DeduplicationService } from './processing/deduplication.service';
import { TextNormalizerService } from './processing/text-normalizer.service';
import { WordAnalyzerService } from './processing/word-analyzer.service';
import { AiProcessingService } from './processing/ai-processing.service';
import { RawItemService } from './storage/raw-item.service';
import { SchedulerService } from './scheduling/scheduler.service';

@Module({
  controllers: [CollectionEngineController],
  providers: [
    CollectionEngineService,
    RssConnectorService,
    WebConnectorService,
    PdfConnectorService,
    KeywordFilterService,
    DeduplicationService,
    TextNormalizerService,
    WordAnalyzerService,
    AiProcessingService,
    RawItemService,
    SchedulerService,
  ],
  exports: [CollectionEngineService],
})
export class CollectionEngineModule {}