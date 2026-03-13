import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DebtRecordService } from '../services/debt.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('finance/debts')
@UseGuards(JwtAuthGuard)
export class DebtRecordController {
  constructor(private readonly debtService: DebtRecordService) {}

  @Post()
  create(@Body() createDebtDto: any) {
    return this.debtService.create(createDebtDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.debtService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: any) {
    return this.debtService.update(id, updateDebtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtService.remove(id);
  }
}
