import { IsString, IsNumber, IsOptional, IsArray, Min, Max, ArrayMinSize } from 'class-validator';

export class GenerateInventoryDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  blocks: string[];

  @IsNumber()
  @Min(0)
  fromFloor: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  toFloor: number;

  @IsNumber()
  @Min(1)
  @Max(20)
  unitsPerFloor: number;

  @IsString()
  @IsOptional()
  codePattern?: string; // default: "{block}-{floor}{unit}"

  @IsNumber()
  @IsOptional()
  defaultArea?: number;

  @IsNumber()
  @IsOptional()
  defaultPrice?: number;

  @IsNumber()
  @IsOptional()
  defaultBedrooms?: number;
}
