import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number, status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    
    return this.prisma.customer.findMany({
      skip, take, where,
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: { take: 3, orderBy: { scheduledAt: 'desc' } }
      }
    });
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { scheduledAt: 'desc' } },
        legalDocs: true,
      }
    });
  }

  async createWithTransaction(data: any, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
       const user = await tx.customer.create({ data });
       
       // Thêm log hoạt động SalesActivity tự động
       await tx.salesActivity.create({
         data: {
           staffId,
           newLeads: 1,
           date: new Date(),
           year: new Date().getFullYear(),
           month: new Date().getMonth() + 1,
           note: `Auto-logged: Vừa tạo mới Lead KH ${data.fullName}`
         }
       });

       return user;
    });
  }
}
