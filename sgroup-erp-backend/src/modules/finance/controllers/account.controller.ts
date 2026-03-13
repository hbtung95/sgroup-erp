import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FinanceAccountService } from '../services/account.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('finance/accounts')
@UseGuards(JwtAuthGuard)
export class FinanceAccountController {
  constructor(private readonly accountService: FinanceAccountService) {}

  @Post()
  create(@Body() createAccountDto: any) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: any) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
