import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username must be at least 6 characters long',
    minLength: 6,
  })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Email must be a valid email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password must be at least 8 characters long' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Mobile number must be in the format XXX-XXX-XXXX',
  })
  @IsString()
  @MinLength(10)
  @IsOptional()
  mobileNumber?: string;

  @ApiProperty({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Default to 'customer' in the entity, so this is optional
}

export class LoginUserDto {
  @ApiProperty({ description: 'Email must be a valid email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password must be at least 8 characters long' })
  @IsString()
  @MinLength(8)
  password: string;
}
