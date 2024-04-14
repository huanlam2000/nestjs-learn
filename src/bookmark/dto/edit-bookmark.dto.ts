import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditBookmarkDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  link?: string;
}
