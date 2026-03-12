/**
 * Base Google Sheets Repository — generic implementation using SheetsClient.
 * Entity-specific repositories extend this with custom filter/stats logic.
 */
import { SheetsClient, SheetRow } from './sheets-client';
import { ColumnMapping, rowToEntity, entityToRow, getHeaders } from './column-mappings';
import { v7 as uuidv7 } from 'uuid';

export class BaseSheetsRepository<T extends { id: string }> {
  constructor(
    protected readonly client: SheetsClient,
    protected readonly sheetName: string,
    protected readonly columns: ColumnMapping[],
  ) {}

  protected toEntity(row: SheetRow): T {
    return rowToEntity<T>(row, this.columns);
  }

  protected toRow(entity: Partial<T>): Record<string, any> {
    return entityToRow(entity as any, this.columns);
  }

  protected get headers(): string[] {
    return getHeaders(this.columns);
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    const rows = await this.client.readSheet(this.sheetName);
    let entities = rows
      .filter(r => r.id) // Skip empty/cleared rows
      .map(r => this.toEntity(r));

    // Apply filters
    if (filters) {
      entities = entities.filter(entity => {
        return Object.entries(filters).every(([key, val]) => {
          if (val === undefined || val === null || val === '') return true;
          const entityVal = (entity as any)[key];
          // Handle search (case-insensitive substring)
          if (key === 'search') {
            const searchFields = ['fullName', 'name', 'phone', 'email', 'customerName'];
            return searchFields.some(f => {
              const fieldVal = (entity as any)[f];
              return fieldVal && String(fieldVal).toLowerCase().includes(String(val).toLowerCase());
            });
          }
          return String(entityVal) === String(val);
        });
      });
    }

    return entities;
  }

  async findById(id: string): Promise<T | null> {
    const row = await this.client.findRow(this.sheetName, 'id', id);
    return row ? this.toEntity(row) : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const now = new Date();
    const entity = {
      ...data,
      id: (data as any).id || uuidv7(),
      createdAt: now,
      updatedAt: now,
    };

    await this.client.appendRow(this.sheetName, this.toRow(entity as any));
    return entity as unknown as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const rows = await this.client.readSheet(this.sheetName);
    const row = rows.find(r => r.id === id);
    if (!row) throw new Error(`Entity not found in ${this.sheetName}: ${id}`);

    const updatedData = { ...data, updatedAt: new Date() };
    await this.client.updateRow(this.sheetName, row._rowIndex, this.toRow(updatedData as any));

    // Return merged entity
    const current = this.toEntity(row);
    return { ...current, ...updatedData } as T;
  }

  async delete(id: string): Promise<T | void> {
    const rows = await this.client.readSheet(this.sheetName);
    const row = rows.find(r => r.id === id);
    if (!row) return;

    // Soft delete: set status to DELETED if entity has status field
    const hasStatus = this.columns.some(c => c.entityField === 'status');
    if (hasStatus) {
      await this.client.updateRow(this.sheetName, row._rowIndex, { status: 'DELETED' });
    } else {
      await this.client.clearRow(this.sheetName, row._rowIndex);
    }
    return this.toEntity(row);
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const entities = await this.findAll(filters);
    return entities.length;
  }

  /**
   * Ensure the sheet tab exists with proper headers.
   */
  async ensureSchema(): Promise<void> {
    await this.client.ensureSheet(this.sheetName, this.headers);
  }
}
