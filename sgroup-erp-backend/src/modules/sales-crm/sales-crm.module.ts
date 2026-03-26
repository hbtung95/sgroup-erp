import { Module } from '@nestjs/common';
import { CustomersController } from './presentation/controllers/customers.controller';
import { ActivitiesController } from './presentation/controllers/activities.controller';
import { AppointmentsController } from './presentation/controllers/appointments.controller';
import { CustomersService } from './application/services/customers.service';
import { CustomersRepository } from './infrastructure/repositories/customers.repository';

@Module({
  controllers: [
    CustomersController,
    ActivitiesController,
    AppointmentsController
  ],
  providers: [
    CustomersService,
    CustomersRepository
  ],
  exports: [CustomersService]
})
export class SalesCrmModule {}
