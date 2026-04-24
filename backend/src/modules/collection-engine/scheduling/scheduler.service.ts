import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('⏰ Running scheduled collection jobs');
    
    try {
      const activePlans = await this.prisma.collectionPlan.findMany({
        where: {
          isActive: true,
          frequency: { in: ['DAILY', 'WEEKLY', 'MONTHLY'] },
        },
      });

      for (const plan of activePlans) {
        await this.checkAndRunCollection(plan);
      }
    } catch (error) {
      this.logger.error(`❌ Scheduler error: ${error.message}`);
    }
  }

  async startScheduler() {
    this.logger.log('🚀 Scheduler service started');
  }

  private async checkAndRunCollection(plan: any) {
    const lastCollected = plan.lastCollectedAt;
    const now = new Date();

    if (!lastCollected) {
      return this.triggerCollection(plan);
    }

    const hoursSinceLastCollection = (now.getTime() - new Date(lastCollected).getTime()) / (1000 * 60 * 60);

    switch (plan.frequency) {
      case 'DAILY':
        if (hoursSinceLastCollection >= 24) {
          await this.triggerCollection(plan);
        }
        break;
      case 'WEEKLY':
        if (hoursSinceLastCollection >= 168) {
          await this.triggerCollection(plan);
        }
        break;
      case 'MONTHLY':
        if (hoursSinceLastCollection >= 720) {
          await this.triggerCollection(plan);
        }
        break;
    }
  }

  private async triggerCollection(plan: any) {
    try {
      await this.prisma.collectionJob.create({
        data: {
          collectionPlanId: plan.id,
          projectId: plan.projectId,
          triggeredBy: 'SCHEDULER',
          status: 'PENDING',
        },
      });

      this.logger.log(`📋 Scheduled collection triggered for plan ${plan.id}`);
    } catch (error) {
      this.logger.error(`❌ Failed to trigger collection: ${error.message}`);
    }
  }
}