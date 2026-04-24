import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddKeywordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsOptional()
  type?: string;
}