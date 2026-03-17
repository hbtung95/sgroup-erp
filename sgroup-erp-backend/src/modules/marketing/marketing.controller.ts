import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // Dashboard
  @Get('dashboard')
  getDashboard() {
    return this.marketingService.getDashboardStats();
  }

  // Campaigns
  @Get('campaigns')
  getCampaigns(@Query('status') status?: string, @Query('channel') channel?: string) {
    return this.marketingService.findAllCampaigns({ status, channel });
  }

  @Post('campaigns')
  createCampaign(@Body() data: any) {
    return this.marketingService.createCampaign(data);
  }

  @Patch('campaigns/:id')
  updateCampaign(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateCampaign(id, data);
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCampaign(@Param('id') id: string) {
    return this.marketingService.deleteCampaign(id);
  }

  // Leads
  @Get('leads')
  getLeads(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.marketingService.findAllLeads({ status, source, campaignId });
  }

  @Post('leads')
  createLead(@Body() data: any) {
    return this.marketingService.createLead(data);
  }

  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateLead(id, data);
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLead(@Param('id') id: string) {
    return this.marketingService.deleteLead(id);
  }

  // Content
  @Get('content')
  getContent(@Query('status') status?: string, @Query('channel') channel?: string) {
    return this.marketingService.findAllContent({ status, channel });
  }

  @Post('content')
  createContent(@Body() data: any) {
    return this.marketingService.createContent(data);
  }

  @Patch('content/:id')
  updateContent(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContent(id, data);
  }

  @Delete('content/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContent(@Param('id') id: string) {
    return this.marketingService.deleteContent(id);
  }

  // Channels
  @Get('channels')
  getChannels(@Query('year') year?: string, @Query('month') month?: string) {
    return this.marketingService.findAllChannels({ year, month });
  }

  @Post('channels')
  upsertChannel(@Body() data: any) {
    return this.marketingService.upsertChannel(data);
  }

  // Budget
  @Get('budget')
  getBudget() {
    return this.marketingService.getBudgetSummary();
  }
}
