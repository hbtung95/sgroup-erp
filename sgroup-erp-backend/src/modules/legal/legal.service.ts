import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalProjectDocs, totalTransactionDocs, activeProjects, activeDeals] = await Promise.all([
      this.prisma.legalProjectDoc.count({ where: { status: 'VALID' } }),
      this.prisma.legalTransactionDoc.count(),
      this.prisma.dimProject.count({ where: { status: 'ACTIVE' } }),
      this.prisma.factDeal.count({ where: { status: 'ACTIVE' } }),
    ]);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringDocs = await this.prisma.legalProjectDoc.count({
      where: {
        expiredDate: { lte: thirtyDaysFromNow, gte: new Date() },
        status: { not: 'EXPIRED' }
      }
    });

    return {
      success: true,
      data: {
        totalProjectDocs,
        totalTransactionDocs,
        activeProjects,
        activeDeals,
        expiringDocs
      }
    };
  }

  async getProjectDocs(projectId: string, query: any = {}) {
    const { status, docType, skip = 0, take = 50 } = query;
    const where: any = { projectId };
    
    if (status) where.status = status;
    if (docType) where.docType = docType;

    const [docs, total] = await Promise.all([
      this.prisma.legalProjectDoc.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      this.prisma.legalProjectDoc.count({ where })
    ]);

    return { 
      success: true, 
      data: docs,
      meta: { total, skip: Number(skip), take: Number(take) }
    };
  }

  async createProjectDoc(projectId: string, data: any) {
    // Basic conversion for dates since they might come as strings
    const docData = { ...data, projectId };
    if (docData.issuedDate) docData.issuedDate = new Date(docData.issuedDate);
    if (docData.expiredDate) docData.expiredDate = new Date(docData.expiredDate);

    const doc = await this.prisma.legalProjectDoc.create({
      data: docData,
    });
    return { success: true, data: doc };
  }

  async updateProjectDoc(docId: string, data: any) {
    const docData = { ...data };
    if (docData.issuedDate) docData.issuedDate = new Date(docData.issuedDate);
    if (docData.expiredDate) docData.expiredDate = new Date(docData.expiredDate);

    const doc = await this.prisma.legalProjectDoc.update({
      where: { id: docId },
      data: docData,
    });
    return { success: true, data: doc };
  }

  async deleteProjectDoc(docId: string) {
    await this.prisma.legalProjectDoc.delete({
      where: { id: docId },
    });
    return { success: true };
  }

  async getTransactionDocs(dealId: string, query: any = {}) {
    const { status, docType, skip = 0, take = 50 } = query;
    const where: any = { dealId };
    
    if (status) where.status = status;
    if (docType) where.docType = docType;

    const [docs, total] = await Promise.all([
      this.prisma.legalTransactionDoc.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      this.prisma.legalTransactionDoc.count({ where })
    ]);

    return { 
      success: true, 
      data: docs,
      meta: { total, skip: Number(skip), take: Number(take) }
    };
  }

  async createTransactionDoc(dealId: string, data: any) {
    const docData = { ...data, dealId };
    if (docData.signedDate) docData.signedDate = new Date(docData.signedDate);

    const doc = await this.prisma.legalTransactionDoc.create({
      data: docData,
    });
    return { success: true, data: doc };
  }

  async updateTransactionDoc(docId: string, data: any) {
    const docData = { ...data };
    if (docData.signedDate) docData.signedDate = new Date(docData.signedDate);

    const doc = await this.prisma.legalTransactionDoc.update({
      where: { id: docId },
      data: docData,
    });
    return { success: true, data: doc };
  }

  async deleteTransactionDoc(docId: string) {
    await this.prisma.legalTransactionDoc.delete({
      where: { id: docId },
    });
    return { success: true };
  }

  async getTemplates(query: any = {}) {
    const { isActive, docType, skip = 0, take = 50 } = query;
    const where: any = {};
    
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (docType) where.docType = docType;

    const [templates, total] = await Promise.all([
      this.prisma.legalTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      this.prisma.legalTemplate.count({ where })
    ]);

    return { 
      success: true, 
      data: templates,
      meta: { total, skip: Number(skip), take: Number(take) }
    };
  }

  async createTemplate(data: any) {
    const template = await this.prisma.legalTemplate.create({
      data,
    });
    return { success: true, data: template };
  }

  async updateTemplate(templateId: string, data: any) {
    const template = await this.prisma.legalTemplate.update({
      where: { id: templateId },
      data,
    });
    return { success: true, data: template };
  }

  async deleteTemplate(templateId: string) {
    await this.prisma.legalTemplate.delete({
      where: { id: templateId },
    });
    return { success: true };
  }
}
