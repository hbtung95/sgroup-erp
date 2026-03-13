import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('api/legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('dashboard')
  getDashboard() {
    return this.legalService.getDashboardStats();
  }

  // Project Docs
  @Get('projects/:projectId/docs')
  getProjectDocs(@Param('projectId') projectId: string, @Query() query: any) {
    return this.legalService.getProjectDocs(projectId, query);
  }

  @Post('projects/:projectId/docs')
  createProjectDoc(@Param('projectId') projectId: string, @Body() data: any) {
    return this.legalService.createProjectDoc(projectId, data);
  }

  @Put('docs/:docId')
  updateProjectDoc(@Param('docId') docId: string, @Body() data: any) {
    return this.legalService.updateProjectDoc(docId, data);
  }

  @Delete('docs/:docId')
  deleteProjectDoc(@Param('docId') docId: string) {
    return this.legalService.deleteProjectDoc(docId);
  }

  // Transaction Docs (Deals)
  @Get('deals/:dealId/docs')
  getTransactionDocs(@Param('dealId') dealId: string) {
    return this.legalService.getTransactionDocs(dealId);
  }

  @Post('deals/:dealId/docs')
  createTransactionDoc(@Param('dealId') dealId: string, @Body() data: any) {
    return this.legalService.createTransactionDoc(dealId, data);
  }

  @Put('transaction-docs/:docId')
  updateTransactionDoc(@Param('docId') docId: string, @Body() data: any) {
    return this.legalService.updateTransactionDoc(docId, data);
  }

  @Delete('transaction-docs/:docId')
  deleteTransactionDoc(@Param('docId') docId: string) {
    return this.legalService.deleteTransactionDoc(docId);
  }

  // Templates
  @Get('templates')
  getTemplates(@Query() query: any) {
    return this.legalService.getTemplates(query);
  }

  @Post('templates')
  createTemplate(@Body() data: any) {
    return this.legalService.createTemplate(data);
  }

  @Put('templates/:templateId')
  updateTemplate(@Param('templateId') templateId: string, @Body() data: any) {
    return this.legalService.updateTemplate(templateId, data);
  }

  @Delete('templates/:templateId')
  deleteTemplate(@Param('templateId') templateId: string) {
    return this.legalService.deleteTemplate(templateId);
  }
}
