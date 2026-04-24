import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddSourceDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsOptional()
  @IsString()
  isActive?: string;
}