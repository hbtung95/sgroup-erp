import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegalCron {
  private readonly logger = new Logger(LegalCron.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run every day at midnight (00:00).
   * Finds documents expiring precisely in 30, 15, or 7 days and sends alerts.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiringDocuments() {
    this.logger.log('Running daily check for expiring legal documents...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDays = [30, 15, 7];

    for (const days of checkDays) {
      const targetDateStart = new Date(today);
      targetDateStart.setDate(today.getDate() + days);
      
      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Find Project Docs
      const expiringProjectDocs = await this.prisma.legalProjectDoc.findMany({
        where: {
          expiredDate: {
            gte: targetDateStart,
            lte: targetDateEnd,
          },
          status: { not: 'EXPIRED' }
        },
        include: {
          project: {
            select: { name: true }
          }
        }
      });

      if (expiringProjectDocs.length > 0) {
        this.logger.warn(`Found ${expiringProjectDocs.length} project docs expiring in ${days} days.`);
        // Note: In production, integrate EmailService/PushNotificationService here.
        expiringProjectDocs.forEach(doc => {
          this.logger.log(`⚠️ ALERT: Project Doc "${doc.name}" for project "${doc.project?.name}" expires on ${doc.expiredDate?.toLocaleDateString()}`);
        });
      }
    }

    this.logger.log('Finished checking expiring legal documents.');
  }
}
