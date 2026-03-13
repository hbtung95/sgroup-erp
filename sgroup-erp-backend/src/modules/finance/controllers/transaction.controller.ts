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
import { FinanceTransactionService } from '../services/transaction.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

export type AuthUser = Omit<User, 'password'>;
@Controller('finance/transactions')
@UseGuards(JwtAuthGuard)
export class FinanceTransactionController {
  constructor(
    private readonly transactionService: FinanceTransactionService,
  ) {}

  @Post()
  create(@Body() createTransactionDto: any, @CurrentUser() user: AuthUser) {
    return this.transactionService.create({
      ...createTransactionDto,
      createdBy: user.id,
    });
  }

  @Get()
  findAll(@Query() query: any) {
    return this.transactionService.findAll(query);
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.transactionService.getDashboardStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: any) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.transactionService.approve(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
