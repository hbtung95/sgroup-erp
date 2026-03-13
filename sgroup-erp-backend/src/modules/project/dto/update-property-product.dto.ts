import { PartialType } from '@nestjs/swagger';
import { CreatePropertyProductDto } from './create-property-product.dto';

export class UpdatePropertyProductDto extends PartialType(CreatePropertyProductDto) {}
