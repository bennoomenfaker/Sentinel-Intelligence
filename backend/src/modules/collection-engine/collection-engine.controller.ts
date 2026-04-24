import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { CollectionEngineService } from './collection-engine.service';
import { CreateCollectionPlanDto } from './dto/create-collection-plan.dto';
import { AddSourceDto } from './dto/add-source.dto';
import { AddKeywordDto } from './dto/add-keyword.dto';

@Controller('collection-plans')
export class CollectionEngineController {
  constructor(private readonly collectionEngineService: CollectionEngineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() dto: CreateCollectionPlanDto) {
    return this.collectionEngineService.createCollectionPlan(dto);
  }

  @Get(':id')
  async getPlan(@Param('id') id: string, @Query('projectId') projectId: string) {
    return this.collectionEngineService.getCollectionPlan(id, projectId);
  }

  @Get()
  async listPlans(@Query('projectId') projectId: string) {
    return this.collectionEngineService.listCollectionPlans(projectId);
  }

  @Post(':id/sources')
  @HttpCode(HttpStatus.CREATED)
  async addSource(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
    @Body() dto: AddSourceDto,
  ) {
    return this.collectionEngineService.addSource(id, projectId, dto);
  }

  @Post(':id/keywords')
  @HttpCode(HttpStatus.CREATED)
  async addKeyword(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
    @Body() dto: AddKeywordDto,
  ) {
    return this.collectionEngineService.addKeyword(id, projectId, dto);
  }

  @Post(':id/collect')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCollection(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.triggerCollection(id, projectId);
  }

  @Post(':id/run')
  @HttpCode(HttpStatus.ACCEPTED)
  async runCollection(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.runCollectionNow(id, projectId);
  }

  @Get(':id/items')
  async getItems(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.getCollectedItems(id, projectId);
  }

  @Get(':id/results')
  async getResults(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.getCollectionResults(id, projectId);
  }

  @Get(':id/jobs')
  async getJobs(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.getCollectionJobs(id, projectId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlan(
    @Param('id') id: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.deleteCollectionPlan(id, projectId);
  }

  @Post('ai/analyze')
  async analyzeWithAi(
    @Body() body: { content: string },
  ) {
    const { content } = body;
    return this.collectionEngineService.analyzeWithAi(content);
  }

  @Delete(':id/sources/:sourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSource(
    @Param('id') id: string,
    @Param('sourceId') sourceId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.deleteSource(id, sourceId, projectId);
  }

  @Delete(':id/keywords/:keywordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKeyword(
    @Param('id') id: string,
    @Param('keywordId') keywordId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.collectionEngineService.deleteKeyword(id, keywordId, projectId);
  }
}