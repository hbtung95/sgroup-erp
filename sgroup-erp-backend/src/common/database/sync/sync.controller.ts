/**
 * Sync Controller — REST endpoints for data migration/sync.
 * Admin-only endpoints for migrating between Google Sheets and PostgreSQL.
 */
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { DataSyncService } from './data-sync.service';

@Controller('admin/sync')
export class SyncController {
  constructor(private syncService: DataSyncService) {}

  /**
   * Migrate data from Google Sheets → PostgreSQL
   * Body: { entities?: string[] } — optional filter (e.g. ["Customer", "Deal"])
   */
  @Post('sheets-to-db')
  async sheetsToDB(@Body() body?: { entities?: string[] }): Promise<any> {
    return {
      message: 'Sync started: Sheets → Database',
      results: await this.syncService.syncSheetsToDB(body?.entities),
    };
  }

  /**
   * Export data from PostgreSQL → Google Sheets
   * Body: { entities?: string[] }
   */
  @Post('db-to-sheets')
  async dbToSheets(@Body() body?: { entities?: string[] }): Promise<any> {
    return {
      message: 'Sync started: Database → Sheets',
      results: await this.syncService.syncDBToSheets(body?.entities),
    };
  }

  /**
   * Get last sync status
   */
  @Get('status')
  getStatus(): any {
    return this.syncService.getStatus();
  }

  /**
   * Initialize sheet tabs with headers (for new spreadsheets)
   */
  @Post('init-sheets')
  async initSheets() {
    const created = await this.syncService.initializeSheets();
    return { message: `Initialized ${created.length} sheet tabs`, tabs: created };
  }
}
