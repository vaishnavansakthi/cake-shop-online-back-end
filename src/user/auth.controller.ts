import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { MailService } from './mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as otpGenerator from 'otp-generator';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post('signin')
  signIn(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.signIn(email, password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
    });
    user.resetOtp = otp; // Generate OTP
    console.log('user', user);
    await this.userRepository.save(user); // Save updated user with OTP
    await this.mailService.sendOtp(email, otp); // Send OTP via email
    return { message: 'OTP sent to your email' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.resetOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return { message: 'OTP verified. You can reset your password.' };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.resetOtp !== null) {
      const hashedPassword = await this.userService.hashPassword(password);
      await this.userService.updatePassword(email, hashedPassword);
    }

    // Hash the new password and update it in the database

    return { message: 'Password successfully reset.' };
  }
}
