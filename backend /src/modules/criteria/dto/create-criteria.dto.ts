import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCriteriaDto {
  @IsString()
  name: string;

  @IsNumber()
  maxPoints: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  description?: string;
}
