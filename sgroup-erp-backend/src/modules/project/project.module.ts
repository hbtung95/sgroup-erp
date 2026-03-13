import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PropertyProductService } from './property-product.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService, PropertyProductService],
  exports: [ProjectService, PropertyProductService],
})
export class ProjectModule {}
