import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyProductDto } from './dto/create-property-product.dto';
import { UpdatePropertyProductDto } from './dto/update-property-product.dto';

@Injectable()
export class PropertyProductService {
  private readonly logger = new Logger(PropertyProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePropertyProductDto) {
    const project = await this.prisma.dimProject.findUnique({
      where: { id: createDto.projectId }
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} not found`);
    }

    return this.prisma.propertyProduct.create({
      data: {
        ...createDto,
        projectName: project.name,
      },
    });
  }

  async findAllByProject(projectId: string) {
    return this.prisma.propertyProduct.findMany({
      where: { projectId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.propertyProduct.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`PropertyProduct with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdatePropertyProductDto) {
    await this.findOne(id);
    return this.prisma.propertyProduct.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.propertyProduct.delete({
      where: { id },
    });
  }

  // ──────────────────────────── EVENT LISTENERS ────────────────────────────

  @OnEvent('deal.created')
  async handleDealCreated(deal: any) {
    if (!deal.productCode) return;
    this.logger.log(`Received deal.created for productCode: ${deal.productCode}`);

    if (['BOOKING', 'DEPOSIT', 'CONTRACT'].includes(deal.stage)) {
      const statusMapping = {
        'BOOKING': 'BOOKED',
        'DEPOSIT': 'DEPOSIT',
        'CONTRACT': 'SOLD'
      };
      const newStatus = statusMapping[deal.stage] || 'BOOKED';

      await this.prisma.propertyProduct.updateMany({
        where: { code: deal.productCode },
        data: {
          status: newStatus,
          bookedBy: deal.staffName || deal.customerName,
        },
      });
      this.logger.log(`PropertyProduct ${deal.productCode} status updated to ${newStatus}`);
    }
  }

  @OnEvent('deal.status_changed')
  async handleDealStatusChanged(payload: { oldDeal: any, newDeal: any }) {
    const { oldDeal, newDeal } = payload;
    if (!newDeal.productCode) return;
    this.logger.log(`Received deal.status_changed for productCode: ${newDeal.productCode}`);

    if (newDeal.stage !== oldDeal.stage) {
      if (['BOOKING', 'DEPOSIT', 'CONTRACT'].includes(newDeal.stage)) {
        const statusMapping = {
          'BOOKING': 'BOOKED',
          'DEPOSIT': 'DEPOSIT',
          'CONTRACT': 'SOLD'
        };
        const newStatus = statusMapping[newDeal.stage] || 'BOOKED';

        await this.prisma.propertyProduct.updateMany({
          where: { code: newDeal.productCode },
          data: {
            status: newStatus,
            bookedBy: newDeal.staffName || newDeal.customerName,
          },
        });
        this.logger.log(`PropertyProduct ${newDeal.productCode} status updated to ${newStatus} due to Deal stage change`);
      } else if (['CANCELLED', 'LEAD', 'MEETING'].includes(newDeal.stage)) {
        await this.prisma.propertyProduct.updateMany({
          where: { code: newDeal.productCode },
          data: {
            status: 'AVAILABLE',
            bookedBy: null,
          },
        });
        this.logger.log(`PropertyProduct ${newDeal.productCode} unlocked and set to AVAILABLE`);
      }
    }
  }
}
