import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GradingDetailDto {
  @IsString()
  criteriaId: string;

  @IsNumber()
  score: number;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

export class SubmitGradingDto {
  @IsString()
  semesterId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradingDetailDto)
  details: GradingDetailDto[];
}
