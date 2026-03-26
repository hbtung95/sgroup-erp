import { Module } from '@nestjs/common';
import { ProjectService } from './application/use-cases/project.service';
import { PropertyProductService } from './application/use-cases/property-product.service';
import { ProjectController } from './presentation/controllers/project.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaProjectRepository } from './infrastructure/database/prisma-project.repository';
import { PrismaPropertyProductRepository } from './infrastructure/database/prisma-property-product.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: 'IProjectRepository',
      useClass: PrismaProjectRepository,
    },
    {
      provide: 'IPropertyProductRepository',
      useClass: PrismaPropertyProductRepository,
    },
    ProjectService,
    PropertyProductService,
  ],
  exports: [ProjectService, PropertyProductService],
})
export class ProjectModule {}
