import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDTO {
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
