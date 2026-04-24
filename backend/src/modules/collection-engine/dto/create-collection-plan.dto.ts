import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCollectionPlanDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  hypothesisId?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}