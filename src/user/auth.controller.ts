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
import * as jwt from 'jsonwebtoken';
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

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Generate JWT token with the OTP and email, valid for 10 minutes
    const resetToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });

    // Store the reset token and expiration in the user entity
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.userRepository.save(user);

    // Send the OTP via email (not the full token)
    await this.mailService.sendOtp(email, otp);

    return { message: 'OTP sent to your email' };
  }

  @Post('verify-token')
  async verifyToken(@Body('email') email: string, @Body('otp') otp: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resetToken) {
      throw new UnauthorizedException('No reset token found');
    }

    // Verify the JWT token
    try {
      const decoded = jwt.verify(user.resetToken, process.env.JWT_SECRET) as {
        email: string;
        otp: string;
      };

      // Check if the provided OTP matches the one in the token
      if (decoded.otp !== otp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      return { message: 'OTP verified. You can reset your password.' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('otp') otp: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resetToken) {
      throw new UnauthorizedException('No reset token found');
    }

    // Verify the token and check the OTP
    try {
      const decoded = jwt.verify(user.resetToken, process.env.JWT_SECRET) as {
        email: string;
        otp: string;
      };

      // Check if the provided OTP matches
      if (decoded.otp !== otp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      // Hash the new password and update it in the database
      const hashedPassword = await this.userService.hashPassword(password);
      await this.userService.updatePassword(email, hashedPassword);

      return { message: 'Password successfully reset.' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
