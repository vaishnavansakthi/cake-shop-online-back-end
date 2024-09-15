import {
  Controller,
  Post,
  Body,
  NotFoundException,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from './role.enum';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './dto/auth.dto';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.mobileNumber,
      createUserDto.role,
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    // Remove or replace the logic that uses UserService
    await this.userService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard) // Ensure only authenticated users can update profiles
  @Put('update-profile/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body('username') username?: string, // Optional field
    @Body('email') email?: string, // Optional field
    @Body('mobileNumber') mobileNumber?: string, // Optional field
    @Body('role') role?: Role,
  ) {
    // Call the service to update the profile
    const updatedUser = await this.userService.updateProfile(
      id,
      username,
      email,
      mobileNumber,
      role,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Profile updated successfully', user: updatedUser };
  }
}
